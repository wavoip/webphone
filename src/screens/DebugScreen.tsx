import {
  BrowserIcon,
  CopyIcon,
  GlobeIcon,
  MicrophoneIcon,
  PackageIcon,
  StethoscopeIcon,
  WarningIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import { runStunProbe, type StunProbeResult } from "@wavoip/wavoip-api";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { collectSystemInfo, type SystemInfo } from "@/lib/system-info";
import { useDebugInfo } from "@/providers/DebugProvider";

const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun.cloudflare.com:3478",
];

export function DebugScreen() {
  const debug = useDebugInfo();
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [stunResults, setStunResults] = useState<{ at: number; results: StunProbeResult[] } | null>(null);
  const [stunRunning, setStunRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    collectSystemInfo()
      .then((info) => {
        if (!cancelled) setSystem(info);
      })
      .catch((err) => console.warn("[DebugScreen] collectSystemInfo failed", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.defaultPrevented) return;
      el.scrollTop += e.deltaY;
      el.scrollLeft += e.deltaX;
    };
    el.addEventListener("wheel", onWheel);
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleProbe = async () => {
    setStunRunning(true);
    try {
      const results = await runStunProbe(DEFAULT_STUN_SERVERS);
      setStunResults({ at: Date.now(), results });
    } finally {
      setStunRunning(false);
    }
  };

  const handleCopy = async () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      versions: {
        webphone: __WEBPHONE_VERSION__,
      },
      system,
      stunResults,
      recentIceDiagnostics: debug.recentIceDiagnostics,
      recentIssues: debug.recentIssues,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="wv:flex wv:flex-col wv:h-full wv:text-foreground">
      <div className="wv:sticky wv:top-0 wv:z-10 wv:flex wv:items-center wv:justify-between wv:gap-2 wv:px-6 wv:pt-4 wv:pb-2 wv:max-sm:px-4 wv:bg-background/95 wv:backdrop-blur">
        <span className="wv:inline-flex wv:items-center wv:gap-1.5 wv:rounded-full wv:border wv:border-border/60 wv:bg-muted/40 wv:px-2 wv:py-0.5 wv:text-xs wv:font-mono wv:tabular-nums wv:text-muted-foreground">
          <PackageIcon className="wv:size-3.5" weight="duotone" />v{__WEBPHONE_VERSION__}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={t("Copy report")}
          className="wv:gap-2"
        >
          <CopyIcon className="wv:size-4" weight="duotone" />
          <span aria-live="polite">{copied ? "✓" : t("Copy report")}</span>
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="wv:flex-1 wv:overflow-auto wv:px-6 wv:pb-6 wv:max-sm:px-4 wv:flex wv:flex-col wv:gap-3"
      >
        <Card title={t("Browser")} icon={<BrowserIcon className="wv:size-4" weight="duotone" />}>
          <p className="wv:text-xs wv:font-mono wv:break-all wv:text-foreground">{system?.userAgent ?? "…"}</p>
        </Card>

        <div className="wv:grid wv:gap-3 wv:sm:grid-cols-2">
          <Card title={t("Network")} icon={<GlobeIcon className="wv:size-4" weight="duotone" />}>
            <KeyValue
              k="online"
              v={system == null ? "…" : <StatusDot ok={system.online} label={system.online ? "online" : "offline"} />}
            />
            {system?.network && (
              <>
                <KeyValue k="effectiveType" v={system.network.effectiveType} />
                <KeyValue k="downlink (Mbps)" v={String(system.network.downlinkMbps)} />
                <KeyValue k="rtt (ms)" v={String(system.network.rttMs)} />
              </>
            )}
          </Card>

          <Card title={t("Audio devices")} icon={<MicrophoneIcon className="wv:size-4" weight="duotone" />}>
            <KeyValue k="microphone permission" v={system?.microphonePermission ?? "…"} />
            <KeyValue k="inputs" v={String(system?.audioInputs.length ?? 0)} />
            <KeyValue k="outputs" v={String(system?.audioOutputs.length ?? 0)} />
          </Card>
        </div>

        <Card title={t("STUN reachability")} icon={<WaveformIcon className="wv:size-4" weight="duotone" />}>
          <div className="wv:flex wv:flex-wrap wv:items-center wv:gap-3">
            <Button
              type="button"
              size="sm"
              onClick={handleProbe}
              disabled={stunRunning}
              aria-label={t("Test STUN")}
              className="wv:bg-green-500 wv:hover:bg-green-600 wv:gap-2 wv:w-fit"
            >
              {stunRunning ? (
                <Loader2Icon className="wv:size-4 wv:animate-spin" />
              ) : (
                <WaveformIcon className="wv:size-4" weight="duotone" />
              )}
              {t("Test STUN")}
            </Button>
            {stunResults && (
              <span className="wv:text-xs wv:text-muted-foreground">
                {t("Tested at")} {formatTimestamp(stunResults.at)}
              </span>
            )}
          </div>
          {stunResults && (
            <ul className="wv:mt-1 wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {stunResults.results.map((r) => (
                <li
                  key={r.server}
                  className="wv:flex wv:items-center wv:gap-2 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1"
                >
                  <ReachableBadge ok={r.reachable} />
                  <span className="wv:flex-1 wv:truncate" title={r.server}>
                    {r.server}
                  </span>
                  {r.reachable && (
                    <span className="wv:tabular-nums wv:text-muted-foreground">{r.latencyMs ?? "?"} ms</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t("Recent ICE diagnostics")} icon={<StethoscopeIcon className="wv:size-4" weight="duotone" />}>
          {debug.recentIceDiagnostics.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="wv:text-xs wv:font-mono wv:flex wv:flex-col wv:gap-2">
              {debug.recentIceDiagnostics
                .slice()
                .reverse()
                .map((r) => (
                  <li
                    key={`${r.at}-${r.callId}`}
                    className="wv:flex wv:flex-col wv:gap-1 wv:rounded wv:bg-muted/40 wv:p-2"
                  >
                    <div className="wv:flex wv:flex-wrap wv:items-center wv:gap-x-2 wv:gap-y-1">
                      <span className="wv:tabular-nums wv:text-muted-foreground">{formatTimestamp(r.at)}</span>
                      <span className="wv:rounded wv:bg-background wv:px-1.5 wv:py-0.5 wv:text-foreground">
                        call: {r.callId}
                      </span>
                    </div>
                    <pre className="wv:whitespace-pre-wrap wv:break-all wv:text-foreground">
                      {JSON.stringify(r.diag, null, 2)}
                    </pre>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card title={t("Recent issues")} icon={<WarningIcon className="wv:size-4" weight="duotone" />}>
          {debug.recentIssues.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {debug.recentIssues
                .slice()
                .reverse()
                .map((r, idx) => (
                  <li
                    key={`${r.at}-${idx}`}
                    className="wv:flex wv:flex-wrap wv:items-center wv:gap-x-2 wv:gap-y-1 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1"
                  >
                    <span className="wv:tabular-nums wv:text-muted-foreground">{formatTimestamp(r.at)}</span>
                    <span className="wv:rounded wv:bg-background wv:px-1.5 wv:py-0.5 wv:text-foreground">
                      call: {r.callId}
                    </span>
                    <span className="wv:rounded wv:bg-red-500/10 wv:px-1.5 wv:py-0.5 wv:text-red-500">{r.issue}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="wv:flex wv:flex-col wv:gap-2 wv:rounded-xl wv:border wv:border-border/60 wv:bg-card wv:p-4">
      <h3 className="wv:flex wv:items-center wv:gap-1.5 wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {icon}
        {title}
      </h3>
      <div className="wv:flex wv:flex-col wv:gap-1.5 wv:text-foreground">{children}</div>
    </section>
  );
}

function formatTimestamp(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function KeyValue({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="wv:grid wv:grid-cols-[minmax(0,9rem)_1fr] wv:gap-2 wv:text-xs wv:font-mono wv:items-center">
      <span className="wv:text-muted-foreground wv:truncate" title={k}>
        {k}
      </span>
      <span className="wv:text-foreground wv:tabular-nums wv:break-all">{v}</span>
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="wv:inline-flex wv:items-center wv:gap-1.5">
      <span aria-hidden className={`wv:size-2 wv:rounded-full ${ok ? "wv:bg-green-500" : "wv:bg-red-500"}`} />
      <span>{label}</span>
    </span>
  );
}

function ReachableBadge({ ok }: { ok: boolean }) {
  return (
    <span
      role="img"
      aria-label={ok ? "reachable" : "unreachable"}
      className={`wv:inline-flex wv:size-4 wv:items-center wv:justify-center wv:rounded-full ${
        ok ? "wv:bg-green-500/15 wv:text-green-500" : "wv:bg-red-500/15 wv:text-red-500"
      }`}
    >
      {ok ? "✓" : "✗"}
    </span>
  );
}

function EmptyState() {
  return <p className="wv:text-xs wv:text-muted-foreground wv:italic">—</p>;
}

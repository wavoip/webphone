import { CopyIcon, WaveformIcon } from "@phosphor-icons/react";
import { runStunProbe, type StunProbeResult } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { collectSystemInfo, type SystemInfo } from "@/lib/system-info";
import { useDebugInfo } from "@/providers/DebugProvider";

const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun.cloudflare.com:3478",
];

type Props = {
  onClose: () => void;
};

export function DebugScreen({ onClose }: Props) {
  const debug = useDebugInfo();
  const [system, setSystem] = useState<SystemInfo | null>(null);
  const [stunResults, setStunResults] = useState<StunProbeResult[] | null>(null);
  const [stunRunning, setStunRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    collectSystemInfo().then((info) => {
      if (!cancelled) setSystem(info);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProbe = async () => {
    setStunRunning(true);
    try {
      const results = await runStunProbe(DEFAULT_STUN_SERVERS);
      setStunResults(results);
    } finally {
      setStunRunning(false);
    }
  };

  const handleCopy = async () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      system,
      stunResults,
      lastIceDiagnostics: debug.lastIceDiagnostics,
      recentIssues: debug.recentIssues,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="wv:flex wv:flex-col wv:h-full wv:text-foreground">
      <div className="wv:flex wv:items-center wv:justify-end wv:gap-2 wv:px-6 wv:pt-4 wv:pb-2 wv:max-sm:px-4">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="wv:gap-2">
          <CopyIcon className="wv:size-4" weight="duotone" />
          {copied ? "✓" : t("Copy report")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("Close")}
        </Button>
      </div>

      <div className="wv:flex-1 wv:overflow-auto wv:px-6 wv:pb-6 wv:max-sm:px-4 wv:flex wv:flex-col wv:gap-4">
        <Card title={t("Browser")}>
          <p className="wv:text-xs wv:font-mono wv:break-all wv:text-foreground">{system?.userAgent ?? "…"}</p>
        </Card>

        <Card title={t("Network")}>
          <KeyValue k="online" v={String(system?.online ?? "…")} />
          {system?.network && (
            <>
              <KeyValue k="effectiveType" v={system.network.effectiveType} />
              <KeyValue k="downlink (Mbps)" v={String(system.network.downlinkMbps)} />
              <KeyValue k="rtt (ms)" v={String(system.network.rttMs)} />
            </>
          )}
        </Card>

        <Card title={t("Audio devices")}>
          <KeyValue k="microphone permission" v={system?.microphonePermission ?? "…"} />
          <KeyValue k="inputs" v={String(system?.audioInputs.length ?? 0)} />
          <KeyValue k="outputs" v={String(system?.audioOutputs.length ?? 0)} />
        </Card>

        <Card title={t("STUN reachability")}>
          <Button
            type="button"
            size="sm"
            onClick={handleProbe}
            disabled={stunRunning}
            className="wv:bg-green-500 wv:hover:bg-green-600 wv:gap-2 wv:w-fit"
          >
            <WaveformIcon className="wv:size-4" weight="duotone" />
            {t("Test STUN")}
          </Button>
          {stunResults && (
            <ul className="wv:mt-2 wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {stunResults.map((r) => (
                <li key={r.server} className="wv:flex wv:gap-2">
                  <span className={r.reachable ? "wv:text-green-500" : "wv:text-red-500"}>
                    {r.reachable ? "✓" : "✗"}
                  </span>
                  <span className="wv:flex-1">{r.server}</span>
                  {r.reachable && <span className="wv:text-muted-foreground">{r.latencyMs ?? "?"} ms</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="ICE">
          <pre className="wv:text-xs wv:font-mono wv:whitespace-pre-wrap wv:break-all wv:text-foreground">
            {debug.lastIceDiagnostics ? JSON.stringify(debug.lastIceDiagnostics, null, 2) : "—"}
          </pre>
        </Card>

        <Card title={t("Recent issues")}>
          {debug.recentIssues.length === 0 ? (
            <p className="wv:text-xs wv:text-muted-foreground">—</p>
          ) : (
            <ul className="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {debug.recentIssues.map((r, idx) => (
                <li key={`${r.at}-${idx}`} className="wv:flex wv:gap-2">
                  <span className="wv:text-muted-foreground">{new Date(r.at).toISOString()}</span>
                  <span className="wv:text-red-500">{r.issue}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="wv:flex wv:flex-col wv:gap-2 wv:rounded-lg wv:border wv:border-border wv:bg-card wv:p-3">
      <h3 className="wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">{title}</h3>
      <div className="wv:flex wv:flex-col wv:gap-1 wv:text-foreground">{children}</div>
    </section>
  );
}

function KeyValue({ k, v }: { k: string; v: string }) {
  return (
    <div className="wv:flex wv:gap-2 wv:text-xs wv:font-mono">
      <span className="wv:text-muted-foreground">{k}:</span>
      <span className="wv:text-foreground">{v}</span>
    </div>
  );
}

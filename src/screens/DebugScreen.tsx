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
  };

  return (
    <div className="wv:flex wv:flex-col wv:gap-4 wv:p-4 wv:max-sm:p-2 wv:h-full wv:overflow-auto wv:text-foreground">
      <header className="wv:flex wv:items-center wv:justify-between wv:gap-2 wv:flex-wrap">
        <h2 className="wv:text-lg wv:font-semibold">{t("Diagnostics")}</h2>
        <div className="wv:flex wv:gap-2 wv:flex-wrap">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {t("Copy report")}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("Close")}
          </Button>
        </div>
      </header>

      <Section title={t("Browser")}>
        <p className="wv:text-xs wv:font-mono wv:break-all">{system?.userAgent ?? "…"}</p>
      </Section>

      <Section title={t("Network")}>
        <KeyValue k="online" v={String(system?.online ?? "…")} />
        {system?.network && (
          <>
            <KeyValue k="effectiveType" v={system.network.effectiveType} />
            <KeyValue k="downlink (Mbps)" v={String(system.network.downlinkMbps)} />
            <KeyValue k="rtt (ms)" v={String(system.network.rttMs)} />
          </>
        )}
      </Section>

      <Section title={t("Audio devices")}>
        <KeyValue k="microphone permission" v={system?.microphonePermission ?? "…"} />
        <KeyValue k="inputs" v={String(system?.audioInputs.length ?? 0)} />
        <KeyValue k="outputs" v={String(system?.audioOutputs.length ?? 0)} />
      </Section>

      <Section title={t("STUN reachability")}>
        <Button type="button" size="sm" onClick={handleProbe} disabled={stunRunning}>
          {t("Test STUN")}
        </Button>
        {stunResults && (
          <ul className="wv:mt-2 wv:text-xs wv:font-mono wv:break-all">
            {stunResults.map((r) => (
              <li key={r.server}>
                {r.server} — {r.reachable ? `✓ ${r.latencyMs ?? "?"} ms` : "✗"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="ICE">
        <pre className="wv:text-xs wv:font-mono wv:whitespace-pre-wrap wv:break-all">
          {debug.lastIceDiagnostics ? JSON.stringify(debug.lastIceDiagnostics, null, 2) : "—"}
        </pre>
      </Section>

      <Section title={t("Recent issues")}>
        {debug.recentIssues.length === 0 && <p className="wv:text-xs">—</p>}
        <ul className="wv:text-xs wv:font-mono wv:break-all">
          {debug.recentIssues.map((r, idx) => (
            <li key={`${r.at}-${idx}`}>
              {new Date(r.at).toISOString()} {r.issue}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="wv:flex wv:flex-col wv:gap-1">
      <h3 className="wv:text-sm wv:font-semibold">{title}</h3>
      <div className="wv:flex wv:flex-col wv:gap-0.5">{children}</div>
    </section>
  );
}

function KeyValue({ k, v }: { k: string; v: string }) {
  return (
    <div className="wv:flex wv:gap-2 wv:text-xs wv:font-mono">
      <span className="wv:text-muted-foreground">{k}:</span>
      <span>{v}</span>
    </div>
  );
}

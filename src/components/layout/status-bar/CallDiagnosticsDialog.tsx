import type { CallActive, CallStats, ServerCallStats, Unsubscribe } from "@wavoip/wavoip-api";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { useDebugInfo } from "@/providers/DebugProvider";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type Props = {
  call: CallActive;
  triggerClassName?: string;
  children: ReactNode;
};

export function CallDiagnosticsDialog({ call, triggerClassName, children }: Props) {
  const { root } = useShadowRoot();
  const debug = useDebugInfo();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [serverStats, setServerStats] = useState<ServerCallStats | null>(null);

  const lastIce = useMemo(() => {
    const own = debug.recentIceDiagnostics.filter((r) => r.callId === call.id);
    return own.length ? own[own.length - 1].diag : null;
  }, [debug.recentIceDiagnostics, call.id]);
  const issues = useMemo(
    () => debug.recentIssues.filter((r) => r.callId === call.id),
    [debug.recentIssues, call.id],
  );

  useEffect(() => {
    const unsubs: Unsubscribe[] = [
      call.on("stats", (s) => setStats(s)),
      call.on("serverStats", (s) => setServerStats(s)),
    ];
    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [call]);

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName} aria-label={t("Call diagnostics")}>
        {children}
      </DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:gap-3 wv:max-w-md wv:max-h-[85vh] wv:overflow-auto wv:p-6 wv:text-foreground"
      >
        <DialogHeader>
          <DialogTitle className="wv:text-foreground">{t("Call diagnostics")}</DialogTitle>
          <DialogDescription className="wv:text-xs wv:font-mono">{`call: ${call.id}`}</DialogDescription>
        </DialogHeader>

        <Section title={t("Realtime stats")}>
          {stats == null && serverStats == null ? (
            <Empty />
          ) : (
            <div className="wv:grid wv:grid-cols-2 wv:gap-2 wv:text-xs wv:font-mono">
              {stats && (
                <>
                  <StatGroup label="RTT (ms)">
                    <KV k="min" v={stats.rtt.min.toFixed(0)} />
                    <KV k="avg" v={stats.rtt.avg.toFixed(0)} />
                    <KV k="max" v={stats.rtt.max.toFixed(0)} />
                  </StatGroup>
                  <StatGroup label="TX">
                    <KV k="pkt" v={String(stats.tx.total)} />
                    <KV k="kB" v={(stats.tx.total_bytes / 1024).toFixed(1)} />
                    <KV k="loss" v={`${(stats.tx.loss * 100).toFixed(1)}%`} />
                  </StatGroup>
                  <StatGroup label="RX">
                    <KV k="pkt" v={String(stats.rx.total)} />
                    <KV k="kB" v={(stats.rx.total_bytes / 1024).toFixed(1)} />
                    <KV k="loss" v={`${(stats.rx.loss * 100).toFixed(1)}%`} />
                  </StatGroup>
                </>
              )}
              {serverStats && (
                <StatGroup label="server RTT (ms)">
                  <KV k="client" v={serverStats.rtt.client.avg.toFixed(0)} />
                  <KV k="whatsapp" v={serverStats.rtt.whatsapp.avg.toFixed(0)} />
                </StatGroup>
              )}
            </div>
          )}
        </Section>

        <Section title="ICE">
          <pre className="wv:text-xs wv:font-mono wv:whitespace-pre-wrap wv:break-all wv:rounded wv:bg-muted/40 wv:p-2">
            {lastIce ? JSON.stringify(lastIce, null, 2) : "—"}
          </pre>
        </Section>

        <Section title={t("Recent issues")}>
          {issues.length === 0 ? (
            <Empty />
          ) : (
            <ul className="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {issues
                .slice()
                .reverse()
                .map((r, idx) => (
                  <li key={`${r.at}-${idx}`} className="wv:flex wv:gap-2 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1">
                    <span className="wv:tabular-nums wv:text-muted-foreground">{formatTime(r.at)}</span>
                    <span className="wv:text-red-500">{r.issue}</span>
                  </li>
                ))}
            </ul>
          )}
        </Section>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="wv:flex wv:flex-col wv:gap-2">
      <h3 className="wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function StatGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wv:flex wv:flex-col wv:gap-1 wv:rounded wv:bg-muted/40 wv:p-2">
      <span className="wv:text-[10px] wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="wv:flex wv:justify-between wv:gap-2">
      <span className="wv:text-muted-foreground">{k}</span>
      <span className="wv:text-foreground wv:tabular-nums">{v}</span>
    </div>
  );
}

function Empty() {
  return <p className="wv:text-xs wv:text-muted-foreground wv:italic">—</p>;
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

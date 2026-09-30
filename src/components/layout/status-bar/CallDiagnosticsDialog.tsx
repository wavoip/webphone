import type { ActiveCall, CallStats } from "@wavoip/wavoip-api/web";
import { createEffect, createMemo, createSignal, type JSX, onCleanup, Show } from "solid-js";
import { AudioLevelBar } from "@/components/layout/status-bar/AudioLevelBar";
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
import { useMount } from "@/providers/MountProvider";

const STATS_POLL_MS = 200;

type Props = {
  call: ActiveCall;
  triggerClass?: string;
  children: JSX.Element;
};

/** `null` é "não medido nesta plataforma", e não zero — por isso o traço em vez de `0`. */
function ms(value: number | null): string {
  return value === null ? "—" : value.toFixed(0);
}

export function CallDiagnosticsDialog(props: Props) {
  const { root } = useMount();
  const debug = useDebugInfo();
  const [open, setOpen] = createSignal(false);
  const [stats, setStats] = createSignal<CallStats | null>(null);

  const lastIce = createMemo(() => {
    const own = debug.recentIceDiagnostics.filter((r) => r.callId === props.call.id);
    return own.at(-1)?.diag ?? null;
  });
  const issues = createMemo(() => debug.recentIssues.filter((r) => r.callId === props.call.id));

  // Só mede com o diálogo aberto: são cinco leituras por segundo do transporte.
  createEffect(() => {
    if (!open()) return;
    let cancelled = false;
    const pull = () => {
      props.call.getStats().then((s) => {
        if (!cancelled) setStats(s);
      });
    };
    pull();
    const id = setInterval(pull, STATS_POLL_MS);
    onCleanup(() => {
      cancelled = true;
      clearInterval(id);
    });
  });

  return (
    <Dialog modal open={open()} onOpenChange={setOpen}>
      <DialogTrigger class={props.triggerClass} aria-label={t("Call diagnostics")}>
        {props.children}
      </DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        class="wv:flex wv:flex-col wv:gap-3 wv:max-w-md wv:max-h-[85vh] wv:overflow-auto wv:p-6 wv:text-foreground"
      >
        <DialogHeader>
          <DialogTitle class="wv:text-foreground">{t("Call diagnostics")}</DialogTitle>
          <DialogDescription class="wv:text-xs wv:font-mono">{`call: ${props.call.id}`}</DialogDescription>
        </DialogHeader>

        <Section title={t("Realtime stats")}>
          <Show when={stats()} fallback={<Empty />}>
            {(stats) => (
              <div class="wv:grid wv:grid-cols-2 wv:gap-2 wv:text-xs wv:font-mono">
                <StatGroup label="RTT (ms)">
                  <KV k="min" v={stats().rtt.min.toFixed(0)} />
                  <KV k="avg" v={stats().rtt.avg.toFixed(0)} />
                  <KV k="max" v={stats().rtt.max.toFixed(0)} />
                </StatGroup>
                <StatGroup label="TX">
                  <KV k="pkt" v={String(stats().packets.tx.sent)} />
                  <KV k="kB" v={(stats().packets.tx.bytes / 1024).toFixed(1)} />
                  <KV k="lost" v={String(stats().packets.tx.lost)} />
                  <KV k="kbps" v={stats().audio.tx.bitrate_kbps.toFixed(1)} />
                </StatGroup>
                <StatGroup label="RX">
                  <KV k="pkt" v={String(stats().packets.rx.received)} />
                  <KV k="kB" v={(stats().packets.rx.bytes / 1024).toFixed(1)} />
                  <KV k="lost" v={String(stats().packets.rx.lost)} />
                  <KV k="kbps" v={stats().audio.rx.bitrate_kbps.toFixed(1)} />
                  <KV k="jitter" v={stats().audio.rx.jitter_ms.toFixed(1)} />
                </StatGroup>
                <StatGroup label={t("Latency (ms)")}>
                  <KV k="total" v={ms(stats().latency.total_ms)} />
                  <KV k="network" v={ms(stats().latency.network_ms)} />
                  <KV k="whatsapp" v={ms(stats().latency.whatsapp_ms)} />
                  <KV k="jitter buf" v={ms(stats().latency.jitter_buffer_ms)} />
                  <KV k="playout" v={ms(stats().latency.playout_ms)} />
                </StatGroup>
              </div>
            )}
          </Show>
        </Section>

        <Show when={open()}>
          <Section title={t("Audio levels")}>
            <div class="wv:flex wv:flex-col wv:gap-2">
              <AudioLevelBar analyser={props.call.audio.out} label="TX (mic)" />
              <AudioLevelBar analyser={props.call.audio.in} label="RX (speaker)" />
            </div>
          </Section>
        </Show>

        <Section title="ICE">
          <pre class="wv:text-xs wv:font-mono wv:whitespace-pre-wrap wv:break-all wv:rounded wv:bg-muted/40 wv:p-2">
            {lastIce() ? JSON.stringify(lastIce(), null, 2) : "—"}
          </pre>
        </Section>

        <Section title={t("Recent issues")}>
          {issues().length === 0 ? (
            <Empty />
          ) : (
            <ul class="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              {issues
                .slice()
                .reverse()
                .map((r, idx) => (
                  <li key={`${r.at}-${idx}`} class="wv:flex wv:gap-2 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1">
                    <span class="wv:tabular-nums wv:text-muted-foreground">{formatTime(r.at)}</span>
                    <span class="wv:text-red-500">{r.issue}</span>
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
    <section class="wv:flex wv:flex-col wv:gap-2">
      <h3 class="wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">{title}</h3>
      {props.children}
    </section>
  );
}

function StatGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div class="wv:flex wv:flex-col wv:gap-1 wv:rounded wv:bg-muted/40 wv:p-2">
      <span class="wv:text-[12px] wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {label}
      </span>
      {props.children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div class="wv:flex wv:justify-between wv:gap-2">
      <span class="wv:text-muted-foreground">{k}</span>
      <span class="wv:text-foreground wv:tabular-nums">{v}</span>
    </div>
  );
}

function Empty() {
  return <p class="wv:text-xs wv:text-muted-foreground wv:italic">—</p>;
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

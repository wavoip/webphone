import { type DiagnosticSeverity, type DiagnosticsReport, runDiagnostics, webRuntime } from "@wavoip/wavoip-api/web";
import { createSignal, For, type JSX, onCleanup, onMount, Show } from "solid-js";
import {
  Browser,
  CircleNotch,
  Copy,
  Globe,
  Microphone,
  Package,
  Stethoscope,
  Warning,
  Waveform,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { collectSystemInfo, type SystemInfo } from "@/lib/system-info";
import { useDebugInfo } from "@/providers/DebugProvider";

const DEFAULT_STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun.cloudflare.com:3478",
];

const SEVERITY_STYLES: Record<DiagnosticSeverity, string> = {
  ok: "wv:bg-green-500/15 wv:text-green-500",
  warning: "wv:bg-amber-500/15 wv:text-amber-500",
  failure: "wv:bg-red-500/15 wv:text-red-500",
};

const SEVERITY_GLYPHS: Record<DiagnosticSeverity, string> = { ok: "✓", warning: "!", failure: "✗" };

export function DebugScreen() {
  const debug = useDebugInfo();
  const [system, setSystem] = createSignal<SystemInfo | null>(null);
  const [checkup, setCheckup] = createSignal<{ at: number; report: DiagnosticsReport } | null>(null);
  const [checkupRunning, setCheckupRunning] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  let scrollEl: HTMLDivElement | undefined;

  onMount(() => {
    let cancelled = false;
    collectSystemInfo()
      .then((info) => {
        if (!cancelled) setSystem(info);
      })
      .catch((err) => console.warn("[DebugScreen] collectSystemInfo failed", err));
    onCleanup(() => {
      cancelled = true;
    });
  });

  // O widget vive dentro do diálogo de configurações, que já trata a roda; sem isto a
  // aba de diagnóstico não rola.
  onMount(() => {
    const el = scrollEl;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.defaultPrevented) return;
      el.scrollTop += e.deltaY;
      el.scrollLeft += e.deltaX;
    };
    el.addEventListener("wheel", onWheel);
    onCleanup(() => el.removeEventListener("wheel", onWheel));
  });

  const handleCheckup = async () => {
    setCheckupRunning(true);
    try {
      const report = await runDiagnostics({ runtime: webRuntime(), stunServers: DEFAULT_STUN_SERVERS });
      setCheckup({ at: Date.now(), report });
    } finally {
      setCheckupRunning(false);
    }
  };

  const handleCopy = async () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      versions: {
        webphone: __WEBPHONE_VERSION__,
      },
      system: system(),
      checkup: checkup(),
      recentIceDiagnostics: debug.recentIceDiagnostics,
      recentIssues: debug.recentIssues,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div class="wv:flex wv:flex-col wv:h-full wv:text-foreground">
      <div class="wv:sticky wv:top-0 wv:z-10 wv:flex wv:items-center wv:justify-between wv:gap-2 wv:px-6 wv:pt-4 wv:pb-2 wv:max-sm:px-4 wv:bg-background/95 wv:backdrop-blur">
        <span class="wv:inline-flex wv:items-center wv:gap-1.5 wv:rounded-full wv:border wv:border-border/60 wv:bg-muted/40 wv:px-2 wv:py-0.5 wv:text-xs wv:font-mono wv:tabular-nums wv:text-muted-foreground">
          <Package class="wv:size-3.5" weight="duotone" />v{__WEBPHONE_VERSION__}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={t("Copy report")}
          class="wv:gap-2"
        >
          <Copy class="wv:size-4" weight="duotone" />
          <span aria-live="polite">{copied() ? "✓" : t("Copy report")}</span>
        </Button>
      </div>

      <div
        ref={scrollEl}
        class="wv:flex-1 wv:overflow-auto wv:px-6 wv:pb-6 wv:max-sm:px-4 wv:flex wv:flex-col wv:gap-3"
      >
        <Card title={t("Browser")} icon={<Browser class="wv:size-4" weight="duotone" />}>
          <p class="wv:text-xs wv:font-mono wv:break-all wv:text-foreground">{system()?.userAgent ?? "…"}</p>
        </Card>

        <div class="wv:grid wv:gap-3 wv:sm:grid-cols-2">
          <Card title={t("Network")} icon={<Globe class="wv:size-4" weight="duotone" />}>
            <KeyValue
              k="online"
              v={
                system() == null ? (
                  "…"
                ) : (
                  <StatusDot ok={!!system()?.online} label={system()?.online ? "online" : "offline"} />
                )
              }
            />
            <Show when={system()?.network}>
              {(rede) => (
                <>
                  <KeyValue k="effectiveType" v={rede().effectiveType} />
                  <KeyValue k="downlink (Mbps)" v={String(rede().downlinkMbps)} />
                  <KeyValue k="rtt (ms)" v={String(rede().rttMs)} />
                </>
              )}
            </Show>
          </Card>

          <Card title={t("Audio devices")} icon={<Microphone class="wv:size-4" weight="duotone" />}>
            <KeyValue k="microphone permission" v={system()?.microphonePermission ?? "…"} />
            <KeyValue k="inputs" v={String(system()?.audioInputs.length ?? 0)} />
            <KeyValue k="outputs" v={String(system()?.audioOutputs.length ?? 0)} />
          </Card>
        </div>

        <Card title={t("Environment check")} icon={<Waveform class="wv:size-4" weight="duotone" />}>
          <div class="wv:flex wv:flex-wrap wv:items-center wv:gap-3">
            <Button
              type="button"
              size="sm"
              onClick={handleCheckup}
              disabled={checkupRunning()}
              aria-label={t("Run check")}
              class="wv:bg-green-500 wv:hover:bg-green-600 wv:gap-2 wv:w-fit"
            >
              <Show when={checkupRunning()} fallback={<Waveform class="wv:size-4" weight="duotone" />}>
                <CircleNotch class="wv:size-4 wv:animate-spin" />
              </Show>
              {t("Run check")}
            </Button>
            <Show when={checkup()}>
              {(feito) => (
                <span class="wv:text-xs wv:text-muted-foreground">
                  {t("Tested at")} {formatTimestamp(feito().at)}
                </span>
              )}
            </Show>
          </div>
          <Show when={checkup()}>
            {(feito) => (
              <>
                <ul class="wv:mt-1 wv:text-xs wv:font-mono wv:flex wv:flex-col wv:gap-1">
                  <For each={Object.entries(feito().report.readiness)}>
                    {([callType, readiness]) => (
                      <li class="wv:flex wv:items-center wv:gap-2 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1">
                        <SeverityBadge severity={readiness.ready ? "ok" : "failure"} />
                        <span class="wv:flex-1 wv:truncate">{callType}</span>
                        <Show when={!readiness.ready}>
                          <span class="wv:text-muted-foreground wv:truncate">{readiness.blockedBy.join(", ")}</span>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
                <ul class="wv:mt-1 wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
                  <For each={feito().report.checks}>
                    {(check) => (
                      <li class="wv:flex wv:items-center wv:gap-2 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1">
                        <SeverityBadge severity={check.severity} />
                        <span class="wv:flex-1 wv:truncate" title={check.code}>
                          {check.code}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </>
            )}
          </Show>
        </Card>

        <Card title={t("Recent ICE diagnostics")} icon={<Stethoscope class="wv:size-4" weight="duotone" />}>
          <Show when={debug.recentIceDiagnostics.length > 0} fallback={<EmptyState />}>
            <ul class="wv:text-xs wv:font-mono wv:flex wv:flex-col wv:gap-2">
              <For each={debug.recentIceDiagnostics.slice().reverse()}>
                {(r) => (
                  <li class="wv:flex wv:flex-col wv:gap-1 wv:rounded wv:bg-muted/40 wv:p-2">
                    <div class="wv:flex wv:flex-wrap wv:items-center wv:gap-x-2 wv:gap-y-1">
                      <span class="wv:tabular-nums wv:text-muted-foreground">{formatTimestamp(r.at)}</span>
                      <span class="wv:rounded wv:bg-background wv:px-1.5 wv:py-0.5 wv:text-foreground">
                        call: {r.callId}
                      </span>
                    </div>
                    <pre class="wv:whitespace-pre-wrap wv:break-all wv:text-foreground">
                      {JSON.stringify(r.diag, null, 2)}
                    </pre>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Card>

        <Card title={t("Recent issues")} icon={<Warning class="wv:size-4" weight="duotone" />}>
          <Show when={debug.recentIssues.length > 0} fallback={<EmptyState />}>
            <ul class="wv:text-xs wv:font-mono wv:break-all wv:flex wv:flex-col wv:gap-1">
              <For each={debug.recentIssues.slice().reverse()}>
                {(r) => (
                  <li class="wv:flex wv:flex-wrap wv:items-center wv:gap-x-2 wv:gap-y-1 wv:rounded wv:bg-muted/40 wv:px-2 wv:py-1">
                    <span class="wv:tabular-nums wv:text-muted-foreground">{formatTimestamp(r.at)}</span>
                    <span class="wv:rounded wv:bg-background wv:px-1.5 wv:py-0.5 wv:text-foreground">
                      call: {r.callId}
                    </span>
                    <span class="wv:rounded wv:bg-red-500/10 wv:px-1.5 wv:py-0.5 wv:text-red-500">{r.issue}</span>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Card>
      </div>
    </div>
  );
}

function Card(props: { title: string; icon?: JSX.Element; children: JSX.Element }) {
  return (
    <section class="wv:flex wv:flex-col wv:gap-2 wv:rounded-xl wv:border wv:border-border/60 wv:bg-card wv:p-4">
      <h3 class="wv:flex wv:items-center wv:gap-1.5 wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {props.icon}
        {props.title}
      </h3>
      <div class="wv:flex wv:flex-col wv:gap-1.5 wv:text-foreground">{props.children}</div>
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

function KeyValue(props: { k: string; v: JSX.Element }) {
  return (
    <div class="wv:grid wv:grid-cols-[minmax(0,9rem)_1fr] wv:gap-2 wv:text-xs wv:font-mono wv:items-center">
      <span class="wv:text-muted-foreground wv:truncate" title={props.k}>
        {props.k}
      </span>
      <span class="wv:text-foreground wv:tabular-nums wv:break-all">{props.v}</span>
    </div>
  );
}

function StatusDot(props: { ok: boolean; label: string }) {
  return (
    <span class="wv:inline-flex wv:items-center wv:gap-1.5">
      <span aria-hidden class={`wv:size-2 wv:rounded-full ${props.ok ? "wv:bg-green-500" : "wv:bg-red-500"}`} />
      <span>{props.label}</span>
    </span>
  );
}

function SeverityBadge(props: { severity: DiagnosticSeverity }) {
  return (
    <span
      role="img"
      aria-label={props.severity}
      class={`wv:inline-flex wv:size-4 wv:items-center wv:justify-center wv:rounded-full ${SEVERITY_STYLES[props.severity]}`}
    >
      {SEVERITY_GLYPHS[props.severity]}
    </span>
  );
}

function EmptyState() {
  return <p class="wv:text-xs wv:text-muted-foreground wv:italic">—</p>;
}

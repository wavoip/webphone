import type { ActiveCall, CallConnection } from "@wavoip/wavoip-api/web";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { WifiHigh, WifiLow, WifiMedium, WifiSlash, WifiX } from "@/components/icons";
import { CallDiagnosticsDialog } from "@/components/layout/status-bar/CallDiagnosticsDialog";

const PING_POLL_MS = 500;

type Props = {
  call: ActiveCall;
};

const ConnectionStrength = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

type ConnectionStrength = (typeof ConnectionStrength)[keyof typeof ConnectionStrength];

const STRENGTH_STYLES: Record<ConnectionStrength, { text: string; bg: string; ring: string }> = {
  [ConnectionStrength.high]: {
    text: "wv:text-emerald-600",
    bg: "wv:bg-emerald-500/10",
    ring: "wv:ring-emerald-500/20",
  },
  [ConnectionStrength.medium]: {
    text: "wv:text-amber-600",
    bg: "wv:bg-amber-500/10",
    ring: "wv:ring-amber-500/20",
  },
  [ConnectionStrength.low]: {
    text: "wv:text-rose-600",
    bg: "wv:bg-rose-500/10",
    ring: "wv:ring-rose-500/20",
  },
  [ConnectionStrength.none]: {
    text: "wv:text-muted-foreground",
    bg: "wv:bg-muted/40",
    ring: "wv:ring-border",
  },
};

export function Ping(props: Props) {
  const [ping, setPing] = createSignal<number | null>(null);
  const [connection, setConnection] = createSignal<CallConnection>(props.call.connection);
  const [strength, setStrength] = createSignal<ConnectionStrength>(ConnectionStrength.high);

  onMount(() => {
    let cancelled = false;
    const pull = () => {
      props.call.getStats().then((s) => {
        if (cancelled) return;
        setPing(s.rtt.avg);
        setStrength(getPingLevel(s.rtt.avg));
      });
    };
    pull();
    const id = setInterval(pull, PING_POLL_MS);

    const unsubConnection = props.call.on("connectionChanged", (next) => {
      setConnection(next);
      if (next === "connected") {
        setStrength((prev) => (prev === ConnectionStrength.none ? ConnectionStrength.high : prev));
      }
      if (next === "disconnected") setStrength(ConnectionStrength.none);
    });

    onCleanup(() => {
      cancelled = true;
      clearInterval(id);
      unsubConnection();
    });
  });

  const style = () => STRENGTH_STYLES[connection() === "disconnected" ? ConnectionStrength.none : strength()];
  const pulsando = () => (connection() === "reconnecting" ? "wv:animate-pulse" : "");

  return (
    <CallDiagnosticsDialog
      call={props.call}
      triggerClass={`wv:flex wv:items-center wv:gap-1.5 wv:rounded-full wv:px-2 wv:py-0.5 wv:ring-1 wv:transition-colors wv:duration-300 wv:hover:cursor-pointer ${style().bg} ${style().ring} ${style().text} ${pulsando()}`}
    >
      <Show
        when={connection() !== "disconnected"}
        fallback={
          <>
            <WifiX class="wv:size-4" />
            <span class="wv:text-[12px] wv:font-medium">offline</span>
          </>
        }
      >
        <SignalIcon strength={strength()} class="wv:size-4" />
        <span class="wv:text-[12px] wv:font-medium wv:tabular-nums wv:whitespace-nowrap">
          {ping() !== null ? `${ping()?.toFixed(0)} ms` : "—"}
        </span>
      </Show>
    </CallDiagnosticsDialog>
  );
}

function SignalIcon(props: { strength: ConnectionStrength; class?: string }) {
  if (props.strength === ConnectionStrength.none) return <WifiSlash class={props.class} />;
  if (props.strength === ConnectionStrength.low) return <WifiLow class={props.class} />;
  if (props.strength === ConnectionStrength.medium) return <WifiMedium class={props.class} />;
  return <WifiHigh class={props.class} />;
}

function getPingLevel(ping: number): ConnectionStrength {
  if (ping <= 300) return ConnectionStrength.high;
  if (ping <= 500) return ConnectionStrength.medium;
  return ConnectionStrength.low;
}

import { WifiHighIcon, WifiLowIcon, WifiMediumIcon, WifiSlashIcon, WifiXIcon } from "@phosphor-icons/react";
import type { CallActive, TransportStatus, Unsubscribe } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";
import { CallDiagnosticsDialog } from "@/components/layout/status-bar/CallDiagnosticsDialog";

type Props = {
  call: CallActive;
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

export function Ping({ call }: Props) {
  const [ping, setPing] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<TransportStatus>(call.connection_status);
  const [strength, setStrength] = useState<ConnectionStrength>(ConnectionStrength.high);

  useEffect(() => {
    const applyPing = (ms: number) => {
      setPing(ms);
      setStrength(getPingLevel(ms));
    };

    const unsubs: Unsubscribe[] = [
      call.on("stats", (s) => applyPing(s.rtt.avg)),
      call.on("serverStats", (s) => applyPing(s.rtt.client.avg)),
      call.on("connectionStatus", (status) => {
        setConnectionStatus(status);
        if (status === "connected")
          setStrength((prev) => (prev === ConnectionStrength.none ? ConnectionStrength.high : prev));
        if (status === "disconnected") setStrength(ConnectionStrength.none);
      }),
    ];

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [call]);

  if (connectionStatus === "disconnected") {
    const style = STRENGTH_STYLES[ConnectionStrength.none];
    return (
      <CallDiagnosticsDialog
        call={call}
        triggerClassName={`wv:flex wv:items-center wv:gap-1.5 wv:rounded-full wv:px-2 wv:py-0.5 wv:ring-1 wv:transition-colors wv:hover:cursor-pointer ${style.bg} ${style.ring} ${style.text}`}
      >
        <WifiXIcon className="wv:size-4" />
        <span className="wv:text-[11px] wv:font-medium">offline</span>
      </CallDiagnosticsDialog>
    );
  }

  const isPending = connectionStatus === "connecting" || connectionStatus === "reconnecting";
  const style = STRENGTH_STYLES[strength];

  return (
    <CallDiagnosticsDialog
      call={call}
      triggerClassName={`wv:flex wv:items-center wv:gap-1.5 wv:rounded-full wv:px-2 wv:py-0.5 wv:ring-1 wv:transition-colors wv:duration-300 wv:hover:cursor-pointer ${style.bg} ${style.ring} ${style.text} ${isPending ? "wv:animate-pulse" : ""}`}
    >
      <SignalIcon strength={strength} className="wv:size-4" />
      <span className="wv:text-[11px] wv:font-medium wv:tabular-nums wv:whitespace-nowrap">
        {ping !== null ? `${ping.toFixed(0)} ms` : "—"}
      </span>
    </CallDiagnosticsDialog>
  );
}

function SignalIcon({ strength, className }: { strength: ConnectionStrength; className?: string }) {
  if (strength === ConnectionStrength.none) return <WifiSlashIcon className={className} />;
  if (strength === ConnectionStrength.low) return <WifiLowIcon className={className} />;
  if (strength === ConnectionStrength.medium) return <WifiMediumIcon className={className} />;
  return <WifiHighIcon className={className} />;
}

function getPingLevel(ping: number): ConnectionStrength {
  if (ping <= 300) return ConnectionStrength.high;
  if (ping <= 500) return ConnectionStrength.medium;
  return ConnectionStrength.low;
}

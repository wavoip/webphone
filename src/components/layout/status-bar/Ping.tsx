import { WifiHighIcon, WifiSlashIcon, WifiXIcon } from "@phosphor-icons/react";
import type { CallActive, TransportStatus } from "@wavoip/wavoip-api";
import { useEffect, useRef, useState } from "react";

type Props = {
  call: CallActive;
};

const ConnectionStrenght = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

type ConnectionStrenght = (typeof ConnectionStrenght)[keyof typeof ConnectionStrenght];

export function Ping({ call }: Props) {
  const [ping, setPing] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<TransportStatus>(call.connection_status);
  const [connectionStrength, setConnectionStrength] = useState<ConnectionStrenght>(ConnectionStrenght.high);
  const connectingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    call.onStats((stats) => {
      const ping = stats.rtt.avg;
      setPing(ping);
      setConnectionStrength(getPingLevel(ping));
    });

    call.onConnectionStatus((status) => {
      setConnectionStatus(status);

      if (status === "connected") {
        setConnectionStrength(ConnectionStrenght.high);
        return;
      }

      if (status === "disconnected") {
        setConnectionStrength(ConnectionStrenght.none);
        return;
      }
    });

    call.onStatus((status) => {
      if (status === "DISCONNECTED") {
        setConnectionStrength(ConnectionStrenght.none);
      }

      if (status === "ACTIVE") {
        setConnectionStrength(ConnectionStrenght.high);
      }
    });

    return () => {
      if (connectingRef.current) {
        clearInterval(connectingRef.current);
      }
    };
  }, [call]);

  if (!call) {
    return null;
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="wv:flex wv:items-center wv:gap-2">
        <WifiXIcon className="wv:size-6" />
      </div>
    );
  }

  const color =
    connectionStrength === ConnectionStrenght.none
      ? "red"
      : connectionStrength === ConnectionStrenght.low
        ? "red"
        : connectionStrength === ConnectionStrenght.medium
          ? "orange"
          : connectionStrength === ConnectionStrenght.high
            ? "green"
            : "red";

  return (
    <div className="wv:flex wv:items-center wv:gap-1" style={{ color: color }}>
      {connectionStrength === ConnectionStrenght.none ? (
        <WifiSlashIcon className="wv:size-5" />
      ) : (
        <WifiHighIcon className="wv:size-5" />
      )}
      {ping !== null && <p className="wv:text-[12px] wv:whitespace-nowrap">{ping.toFixed(0)} ms</p>}
    </div>
  );
}

function getPingLevel(ping: number): ConnectionStrenght {
  if (ping <= 300) {
    return ConnectionStrenght.high;
  }

  if (ping > 300 && ping <= 500) {
    return ConnectionStrenght.medium;
  }

  return ConnectionStrenght.low;
}

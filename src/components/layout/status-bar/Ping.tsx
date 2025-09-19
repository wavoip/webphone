import {
  WifiHighIcon,
  WifiLowIcon,
  WifiMediumIcon,
  WifiNoneIcon,
  WifiSlashIcon,
  WifiXIcon,
} from "@phosphor-icons/react";
import type { CallActive, MultimediaSocketStatus } from "@wavoip/wavoip-api";
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
  const [connectionStatus, setConnectionStatus] = useState<MultimediaSocketStatus>(call.connection_status);
  const [connectionStrength, setConnectionStrength] = useState<ConnectionStrenght>(ConnectionStrenght.high);
  const connectingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    call.onStats((stats) => {
      const ping = stats.rtt.client.avg + stats.rtt.whatsapp.avg;
      setPing(ping);
      setConnectionStrength(getPingLevel(ping));
    });

    call.onConnectionStatus((status) => {
      console.log("STATUS", status);
      setConnectionStatus(status);

      if (status === "CONNECTING") {
        connectingRef.current = setInterval(() => {
          setConnectionStrength((prev) => ((prev + 1) % 4) as ConnectionStrenght);
        }, 1000);

        return;
      } else if (connectingRef.current) {
        clearInterval(connectingRef.current);
      }

      if (status === "CONNECTED") {
        setConnectionStrength(ConnectionStrenght.high);
        return;
      }

      if (status === "CLOSED" || status === "ERROR") {
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

  if (connectionStatus === "ERROR") {
    return (
      <div className="wv:flex wv:items-center wv:gap-2 wv:text-background">
        <WifiXIcon className="wv:size-6" />
      </div>
    );
  }

  return (
    <div className="wv:flex wv:items-center wv:gap-2 wv:text-background">
      {connectionStrength === ConnectionStrenght.none ? (
        <WifiNoneIcon className="wv:size-6" />
      ) : connectionStrength === ConnectionStrenght.low ? (
        <WifiLowIcon className="wv:size-6" />
      ) : connectionStrength === ConnectionStrenght.medium ? (
        <WifiMediumIcon className="wv:size-6" />
      ) : connectionStrength === ConnectionStrenght.high ? (
        <WifiHighIcon className="wv:size-6" />
      ) : (
        <WifiSlashIcon className="wv:size-6" />
      )}
      <p className="wv:text-sm">{ping?.toFixed(2)} ms</p>
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

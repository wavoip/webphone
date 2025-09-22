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
          // setConnectionStrength((prev) => ((prev + 1) % 4) as ConnectionStrenght);
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
      <div className="wv:flex wv:items-center wv:gap-2">
        <WifiXIcon className="wv:size-6" />
      </div>
    );
  }

  const color = connectionStrength === ConnectionStrenght.none ? (
    "red"
  ) : connectionStrength === ConnectionStrenght.low ? (
    "red"
  ) : connectionStrength === ConnectionStrenght.medium ? (
    "orange"
  ) : connectionStrength === ConnectionStrenght.high ? (
    "green"
  ) : (
    "red"
  );

  return (
    <div className="wv:flex wv:items-center wv:gap-2 wv:group wv:relative wv:cursor-pointer wv:hover:text-accent-foreground" style={{ color: color }}>

      {connectionStrength === ConnectionStrenght.none ? (
        <WifiSlashIcon className="wv:size-5" />
      ) : [ConnectionStrenght.low, ConnectionStrenght.medium, ConnectionStrenght.high].includes(connectionStrength) ? (
        <WifiHighIcon className="wv:size-5" />
      ) : (
        <WifiSlashIcon className="wv:size-5" />
      )}
      <div className="wv:absolute wv:right-0 wv:translate-x-10 wv:opacity-0 wv:transition-all wv:duration-500 wv:ease-out wv:group-hover:translate-x-15 wv:group-hover:opacity-100">

        <p className="wv:text-[12px] wv:whitespace-nowrap">{ping?.toFixed(2)} ms</p>
      </div>
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

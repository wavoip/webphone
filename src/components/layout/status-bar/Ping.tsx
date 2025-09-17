import { WifiHighIcon, WifiLowIcon, WifiMediumIcon, WifiSlashIcon } from "@phosphor-icons/react";
import type { CallActive } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";

type Props = {
  call: CallActive;
};

export function Ping({ call }: Props) {
  const [ping, setPing] = useState<number | null>(null);
  const [connectionStrength, setConnectionStrength] = useState<"low" | "medium" | "high" | "none">("none");

  call.onStats((stats) => {
    const ping = stats.rtt.client.avg + stats.rtt.whatsapp.avg;
    setPing(ping);
    setConnectionStrength(getPingLevel(ping));
  });

  useEffect(() => {
    if (!call) {
      setPing(null);
    }
  }, [call]);

  if (!ping) {
    return null;
  }

  return (
    <div className="wv:flex wv:items-center wv:gap-2 wv:text-background">
      {connectionStrength === "low" ? (
        <WifiLowIcon className="wv:size-6" />
      ) : connectionStrength === "medium" ? (
        <WifiMediumIcon className="wv:size-6" />
      ) : connectionStrength === "high" ? (
        <WifiHighIcon className="wv:size-6" />
      ) : (
        <WifiSlashIcon className="wv:size-6" />
      )}
      <p className="wv:text-sm">{ping.toFixed(2)} ms</p>
    </div>
  );
}

function getPingLevel(ping: number) {
  if (ping <= 300) {
    return "high" as const;
  }

  if (ping > 300 && ping <= 500) {
    return "medium" as const;
  }

  return "low" as const;
}

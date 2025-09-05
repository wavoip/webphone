import { WifiHighIcon, WifiLowIcon, WifiMediumIcon, WifiSlashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { CallActive } from "wavoip-api";

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
    <div className="flex items-center gap-2">
      {connectionStrength === "low" ? (
        <WifiLowIcon className="size-6" />
      ) : connectionStrength === "medium" ? (
        <WifiMediumIcon className="size-6" />
      ) : connectionStrength === "high" ? (
        <WifiHighIcon className="size-6" />
      ) : (
        <WifiSlashIcon className="size-6" />
      )}
      <p className="text-sm">{ping.toFixed(2)} ms</p>
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

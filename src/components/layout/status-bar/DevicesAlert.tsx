import { WarningIcon } from "@phosphor-icons/react";
import { Badge } from "lucide-react";
import { useMemo } from "react";
import type { Device } from "wavoip-api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  devices: Device[];
};

export function DevicesAlert({ devices }: Props) {
  const disconnectedDevices = useMemo(() => devices.filter(({ status }) => status === "DISCONNECTED"), [devices]);
  const qrcodeDevices = useMemo(() => devices.filter(({ status }) => status === "connecting"), [devices]);
  const closedDevices = useMemo(() => devices.filter(({ status }) => status === "close"), [devices]);
  const hibernatedDevices = useMemo(() => devices.filter(({ status }) => status === "hibernating"), [devices]);

  const hasWarnings =
    disconnectedDevices.length && qrcodeDevices.length && closedDevices.length && hibernatedDevices.length;

  if (!hasWarnings) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <WarningIcon size={24} />
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-center gap-1">
        {!!disconnectedDevices.length && (
          <div className="flex flex-col items-start justify-center">
            <p>Dispositivos desconectados</p>
            <div className="flex gap-1">
              {disconnectedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!qrcodeDevices.length && (
          <div className="flex flex-col items-start">
            <p>Dispositivos para ler QRCode</p>
            <div className="flex gap-1">
              {qrcodeDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!closedDevices.length && (
          <div className="flex flex-col items-start">
            <p>Dispositivos fechados</p>
            <div className="flex gap-1">
              {closedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!hibernatedDevices.length && (
          <div className="flex flex-col items-start">
            <p>Dispositivos hibernando</p>
            <div className="flex gap-1">
              {hibernatedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

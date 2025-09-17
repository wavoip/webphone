import { WarningIcon } from "@phosphor-icons/react";
import type { Device } from "@wavoip/wavoip-api";
import { Badge } from "lucide-react";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  devices: Device[];
};

export function DevicesAlert({ devices }: Props) {
  const disconnectedDevices = useMemo(() => devices.filter(({ status }) => status === "disconnected"), [devices]);
  const qrcodeDevices = useMemo(() => devices.filter(({ status }) => status === "connecting"), [devices]);
  const closedDevices = useMemo(() => devices.filter(({ status }) => status === "close"), [devices]);
  const hibernatedDevices = useMemo(() => devices.filter(({ status }) => status === "hibernating"), [devices]);
  const errorDevices = useMemo(
    () => devices.filter(({ status }) => status === "error" || status === "EXTERNAL_INTEGRATION_ERROR"),
    [devices],
  );

  const hasWarnings =
    disconnectedDevices.length && qrcodeDevices.length && closedDevices.length && hibernatedDevices.length;

  if (!hasWarnings) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <WarningIcon className="wv:size-6 wv:text-foreground" />
      </TooltipTrigger>
      <TooltipContent className="wv:flex wv:flex-col wv:items-center wv:gap-1">
        {!!disconnectedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start wv:justify-center">
            <p>Dispositivos desconectados</p>
            <div className="wv:flex wv:gap-1">
              {disconnectedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!qrcodeDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>Dispositivos para ler QRCode</p>
            <div className="wv:flex wv:gap-1">
              {qrcodeDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!closedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>Dispositivos fechados</p>
            <div className="wv:flex wv:gap-1">
              {closedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!hibernatedDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>Dispositivos hibernando</p>
            <div className="wv:flex wv:gap-1">
              {hibernatedDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
        {!!errorDevices.length && (
          <div className="wv:flex wv:flex-col wv:items-start">
            <p>Dispositivos com erro</p>
            <div className="wv:flex wv:gap-1">
              {errorDevices.map((device) => (
                <Badge key={device.token}>{device.token}</Badge>
              ))}
            </div>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

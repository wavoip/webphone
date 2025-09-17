import { QrCodeIcon, TrashIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import type { Device } from "@wavoip/wavoip-api";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  device: Device & { enable: boolean };
  setShowQRCode: React.Dispatch<React.SetStateAction<null | string>>;
};

export function DeviceInfo({ device, setShowQRCode }: Props) {
  const { removeDevice, disableDevice, enableDevice } = useWavoip();

  const badgeVariant = useMemo(
    () =>
      ["disconnected", "close", "error", "EXTERNAL_INTEGRATION_ERROR"].includes(device.status as string)
        ? "destructive"
        : ["BUILDING", "restarting", "hibernating", "WAITING_PAYMENT"].includes(device.status as string)
          ? "secondary"
          : "default",
    [device.status],
  );

  return (
    <div
      data-enable={device.enable}
      className="wv:flex wv:justify-between wv:items-center wv:gap-2 wv:p-2 wv:bg-muted wv:data-[enable=false]:bg-muted-foreground/30 wv:rounded-md"
    >
      <div className="wv:flex wv:flex-col wv:gap-2">
        <p data-enable={device.enable} className="wv:font-medium wv:data-[enable=false]:text-muted-foreground">
          {device.token}
        </p>
        <div className="wv:flex wv:items-center wv:gap-2">
          {device.status && (
            <>
              <Badge variant={badgeVariant}>{device.status.toUpperCase()}</Badge>
              {["disconnected", "hibernating"].includes(device.status) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="wv:size-fit !wv:p-0.5 wv:aspect-square wv:hover:cursor-pointer"
                      onClick={() => device.powerOn()}
                    >
                      <PowerIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ligar Dispositivo</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {device.qrcode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  className="wv:size-fit !wv:p-0.5 wv:aspect-square wv:hover:cursor-pointer"
                  onClick={() => setShowQRCode(device.qrcode)}
                >
                  <QrCodeIcon className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mostrar QRCode</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="wv:flex wv:gap-2 wv:items-center">
        <Switch
          className="wv:hover:cursor-pointer"
          checked={device.enable}
          onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
          disabled={!["open", "CONNECTED"].includes(device.status as string)}
        />
        <Button
          variant={"destructive"}
          className="wv:size-fit !wv:p-1.5 wv:aspect-square wv:hover:cursor-pointer"
          onClick={() => removeDevice(device.token)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}

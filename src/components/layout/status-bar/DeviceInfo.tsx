import { QrCodeIcon, TrashIcon } from "@phosphor-icons/react";
import { PowerIcon } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import type { Device } from "wavoip-api";
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
      className="flex justify-between items-center gap-2 p-2 bg-muted data-[enable=false]:bg-muted-foreground/30 rounded-md"
    >
      <div className="flex flex-col gap-2">
        <p data-enable={device.enable} className="font-medium data-[enable=false]:text-muted-foreground">
          {device.token}
        </p>
        <div className="flex items-center gap-2">
          {device.status && (
            <>
              <Badge variant={badgeVariant}>{device.status.toUpperCase()}</Badge>
              {["disconnected", "hibernating"].includes(device.status) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="size-fit !p-0.5 aspect-square hover:cursor-pointer"
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
                  className="size-fit !p-0.5 aspect-square hover:cursor-pointer"
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
      <div className="flex gap-2 items-center">
        <Switch
          className="hover:cursor-pointer"
          checked={device.enable}
          onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
          disabled={!["open", "CONNECTED"].includes(device.status as string)}
        />
        <Button
          variant={"destructive"}
          className="size-fit !p-1.5 aspect-square hover:cursor-pointer"
          onClick={() => removeDevice(device.token)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}

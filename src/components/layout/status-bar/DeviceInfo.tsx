import { QrCodeIcon, TrashIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
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
  const { wavoipInstance, removeDevice, disableDevice, enableDevice } = useWavoip();

  const _device = wavoipInstance.getDevices().find(({ token }) => device.token === token);
  const [qrcode, setQrcode] = useState(_device?.qrcode || device.qrcode);
  const [status, setStatus] = useState(_device?.status || device.status);

  device.onQRCode((qrcode) => {
    setQrcode(qrcode);
  });

  device.onStatus((status) => {
    setStatus(status);
  });

  const badgeVariant = useMemo(
    () =>
      ["DISCONNECTED", "close", "error", "EXTERNAL_INTEGRATION_ERROR"].includes(status as string)
        ? "destructive"
        : ["BUILDING", "RESTARTING", "HIBERNATING", "WAITING_PAYMENT"].includes(status as string)
          ? "secondary"
          : "default",
    [status],
  );

  return (
    <div className="flex justify-between items-center gap-2 p-2 bg-muted rounded-md">
      <div className="flex flex-col gap-2">
        <p className="font-medium">{device.token}</p>
        <div className="flex items-center gap-2">
          {status && <Badge variant={badgeVariant}>{status.toUpperCase()}</Badge>}
          {qrcode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  className="size-fit !p-0.5 aspect-square hover:cursor-pointer"
                  onClick={() => setShowQRCode(qrcode)}
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
        <Button
          variant={"destructive"}
          className="size-fit !p-1.5 aspect-square hover:cursor-pointer"
          onClick={() => removeDevice(device.token)}
        >
          <TrashIcon />
        </Button>
        <Switch
          className="hover:cursor-pointer"
          checked={device.enable}
          onCheckedChange={(checked) => (checked ? enableDevice(device.token) : disableDevice(device.token))}
          disabled={!["open", "CONNECTED"].includes(status as string)}
        />
      </div>
    </div>
  );
}

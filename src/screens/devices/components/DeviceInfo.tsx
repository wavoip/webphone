import { TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import QRCode from "react-qr-code";
import type { Device } from "wavoip-api";
import { Button } from "@/components/ui/button";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  device: Device;
};

export function DeviceInfo({ device }: Props) {
  const { removeDevice } = useWavoip();
  const [qrcode, setQrcode] = useState(device.qrcode);
  const [status, setStatus] = useState(device.status);

  device.onQRCode((qrcode) => {
    setQrcode(qrcode);
  });

  device.onStatus((status) => {
    setStatus(status);
  });

  return (
    <div className="flex justify-between items-center gap-2 p-2 bg-muted rounded-md">
      <p>Dispositivo: {device.token.split("-")[0]}</p>
      <p>Status: {status}</p>
      {(status === "connecting" || status === "DISCONNECTED" || status === "close") && qrcode && (
        <QRCode value={qrcode} size={150} level="L"></QRCode>
      )}
      {status === "open" && <p>Pronto para uso</p>}
      <Button
        variant={"destructive"}
        className="size-fit !p-1.5 aspect-square hover:cursor-pointer"
        onClick={() => removeDevice(device.token)}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

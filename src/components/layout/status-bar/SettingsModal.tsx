import { GearIcon } from "@phosphor-icons/react";
import type { Device } from "@wavoip/wavoip-api";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { DeviceInfo } from "@/components/layout/status-bar/DeviceInfo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDraggable } from "@/providers/DraggableProvider";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  devices: (Device & { enable: boolean })[];
};

export function SettingsModal({ devices }: Props) {
  const { addDevice } = useWavoip();
  const { setModal } = useDraggable();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [qrcode, setQrcode] = useState<null | string>(null);

  const devicesSorted = useMemo(() => devices.sort((a, b) => Number(b.enable) - Number(a.enable)), [devices]);

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(open) => {
        if (qrcode && !open) {
          setQrcode(null);
          return;
        }
        setModal();
        setOpen(open);
      }}
    >
      <DialogTrigger className="text-background hover:cursor-pointer hover:bg-background hover:text-foreground p-0.5 rounded-md">
        <GearIcon />
      </DialogTrigger>
      <DialogContent className="flex flex-col h-1/2">
        {qrcode ? (
          <>
            <DialogHeader>
              <DialogTitle>QRCode</DialogTitle>
            </DialogHeader>
            <DialogDescription>Aponte a câmera do celular</DialogDescription>
            <QRCode value={qrcode} level="L" className="size-full"></QRCode>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Dispositivos</DialogTitle>
            </DialogHeader>
            <DialogDescription />
            <div className="flex justify-between items-center gap-2">
              <Input
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="focus-visible:ring-0 flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  addDevice(token);
                  setToken("");
                }}
                className="bg-green-400 size-fit !p-1.5 h-full aspect-square hover:cursor-pointer"
              >
                <PlusIcon />
              </Button>
            </div>
            <div className="basis-0 flex-1 overflow-auto flex flex-col gap-2">
              {devicesSorted.map((device) => (
                <DeviceInfo key={device.token} device={device} setShowQRCode={setQrcode} />
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

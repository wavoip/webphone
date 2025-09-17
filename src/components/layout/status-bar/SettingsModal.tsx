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
  root: Element;
};

export function SettingsModal({ devices, root }: Props) {
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
      <DialogTrigger className="wv:text-background wv:hover:cursor-pointer wv:hover:bg-background wv:hover:text-foreground wv:p-0.5 wv:rounded-md">
        <GearIcon />
      </DialogTrigger>
      <DialogContent className="wv:flex wv:flex-col wv:h-1/2 wv:z-[999999999999]" container={root}>
        {qrcode ? (
          <>
            <DialogHeader>
              <DialogTitle>QRCode</DialogTitle>
            </DialogHeader>
            <DialogDescription>Aponte a câmera do celular</DialogDescription>
            <QRCode value={qrcode} level="L" className="wv:size-full"></QRCode>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Dispositivos</DialogTitle>
            </DialogHeader>
            <DialogDescription />
            <div className="wv:flex wv:justify-between wv:items-center wv:gap-2">
              <Input
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="wv:focus-visible:ring-0 wv:flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  addDevice(token);
                  setToken("");
                }}
                className="wv:bg-green-400 wv:size-fit !wv:p-1.5 wv:h-full wv:aspect-square wv:hover:cursor-pointer"
              >
                <PlusIcon />
              </Button>
            </div>
            <div className="wv:basis-0 wv:flex-1 wv:overflow-auto wv:flex wv:flex-col wv:gap-2">
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

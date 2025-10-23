import { GearIcon } from "@phosphor-icons/react";
import type { Device } from "@wavoip/wavoip-api";
import { PlusIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
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
import { useWavoip } from "@/providers/WavoipProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";

type Props = {
  devices: (Device & { enable: boolean })[];
  root: Element;
};

export const SettingsModal = forwardRef(({ devices, root }: Props) => {
  const { addDevice } = useWavoip();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [qrcode, setQrcode] = useState<null | string>(null);
  const { wavoip } = useWavoip();
  const devicesSorted = useMemo(() => devices.sort((a, b) => Number(b.enable) - Number(a.enable)), [devices]);


  useEffect(() => {
    if (wavoip) {
      wavoip.getMultimediaDevices();
    }
  }, [open]);

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(open) => {
        if (qrcode && !open) {
          setQrcode(null);
          return;
        }
        setOpen(open);
      }}

    >
      <DialogTrigger className="wv:hover:cursor-pointer wv:hover:bg-background wv:hover:text-foreground wv:p-0.5 wv:rounded-md">
        <GearIcon />
      </DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:h-1/2 wv:z-[999999999999]"
        container={root}

      >
        <div className="wv:flex wv:w-full wv:flex-col wv:gap-6 wv:overflow-hidden">
          <Tabs defaultValue="account" orientation="vertical" className="wv:overflow-hidden">
            <TabsList>
              <TabsTrigger value="account">Números</TabsTrigger>
              <TabsTrigger value="settings">Audio</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="wv:overflow-auto">
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
                    <DialogTitle></DialogTitle>
                  </DialogHeader>
                  <DialogDescription />
                  <div className="wv:flex wv:justify-between wv:items-center wv:gap-2 wv:py-4">
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
                  <div className="wv:overflow-auto wv:flex wv:flex-col wv:gap-2">
                    {devicesSorted.map((device) => (
                      <DeviceInfo key={device.token} device={device} setShowQRCode={setQrcode} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="settings">
              <AudioConfig />
            </TabsContent>
          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  );
})

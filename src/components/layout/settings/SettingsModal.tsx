import { GearIcon } from "@phosphor-icons/react";
import type { Device } from "@wavoip/wavoip-api";
import { PlusIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mergeToAPI } from "@/lib/webphone-api";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";

type Props = {
  devices: (Device & { enable: boolean })[];
};

export const SettingsModal = forwardRef(({ devices }: Props) => {
  const { wavoip, addDevice } = useWavoip();
  const { root } = useShadowRoot();
  const { audio: audioMenuSettings, devices: devicesMenuSettings } = useSettings();

  const [showAudio] = useState(audioMenuSettings.show);
  const [showDevices, setShowDevices] = useState(devicesMenuSettings.show);
  const [showAddDevice, setShowAddDevice] = useState(devicesMenuSettings.showAdd);
  const [showEnableDevice, setShowEnableDevice] = useState(devicesMenuSettings.enableShow);
  const [showRemoveDevice, setShowRemoveDevice] = useState(devicesMenuSettings.removeShow);

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [qrcode, setQrcode] = useState<null | string>(null);
  const devicesSorted = useMemo(() => devices.sort((a, b) => Number(b.enable) - Number(a.enable)), [devices]);

  useEffect(() => {
    mergeToAPI({
      settings: {
        showDevices,
        setShowDevices: (...args) => setShowDevices(...args),
        showAddDevices: showAddDevice,
        setShowAddDevices: (...args) => setShowAddDevice(...args),
        showEnableDevices: showEnableDevice,
        setShowEnableDevices: (...args) => setShowEnableDevice(...args),
        showRemoveDevices: showRemoveDevice,
        setShowRemoveDevices: (...args) => setShowRemoveDevice(...args),
      },
    });
  }, [showDevices, showAddDevice, showEnableDevice, showRemoveDevice]);

  useEffect(() => {
    if (wavoip && open) {
      wavoip.getMultimediaDevices();
    }
  }, [open, wavoip]);

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
      <DialogTrigger className="wv:hover:cursor-pointer wv:hover:bg-background wv:text-foreground wv:hover:text-foreground wv:p-0.5 wv:rounded-full wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:max-sm:p-2">
        <GearIcon className="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
      </DialogTrigger>
      <DialogContent container={root} onClick={(e) => e.stopPropagation()} className="wv:flex wv:flex-col wv:h-1/2">
        <DialogTitle className="wv:sr-only">Configurações</DialogTitle>
        <DialogDescription className="wv:sr-only">Aqui você pode configurar todo webphone</DialogDescription>
        <div className="wv:flex wv:w-full wv:flex-col wv:gap-6 wv:overflow-hidden">
          {qrcode && (
            <>
              <DialogHeader>
                <DialogTitle>QRCode</DialogTitle>
                <DialogDescription>Aponte a câmera do celular</DialogDescription>
              </DialogHeader>

              <QRCode value={qrcode} level="L" className="wv:size-full"></QRCode>
            </>
          )}
          {!qrcode && (
            <Tabs defaultValue="devices" orientation="vertical" className="wv:overflow-hidden">
              <TabsList>
                {showDevices && <TabsTrigger value="devices">Números</TabsTrigger>}
                {showAudio && (
                  <TabsTrigger value="settings" disabled>
                    Audio
                  </TabsTrigger>
                )}
              </TabsList>
              {showDevices && (
                <TabsContent value="devices" className="wv:overflow-auto">
                  <DialogHeader>
                    <DialogTitle></DialogTitle>
                  </DialogHeader>
                  <DialogDescription />
                  {showAddDevice && (
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
                  )}

                  <div className="wv:overflow-auto wv:flex wv:flex-col wv:gap-2">
                    {devicesSorted.map((device) => (
                      <DeviceInfo
                        key={device.token}
                        settings={{ showEnable: showEnableDevice, showRemove: showRemoveDevice }}
                        device={device}
                        setShowQRCode={setQrcode}
                      />
                    ))}
                  </div>
                </TabsContent>
              )}
              {showAudio && (
                <TabsContent value="settings">
                  <AudioConfig />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

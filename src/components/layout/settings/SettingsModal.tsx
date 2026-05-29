import { GearIcon } from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
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
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWavoip } from "@/providers/WavoipProvider";
import { DebugScreen } from "@/screens/DebugScreen";

export const SettingsModal = forwardRef(() => {
  const { wavoip, addDevice, devices } = useWavoip();
  const { root } = useShadowRoot();
  const { audio: audioMenuSettings } = useSettings();

  const [showAudio] = useState(audioMenuSettings.show);

  const middleware = useMiddleware();
  const { showDevices, showAddDevice, showEnableDevice, showRemoveDevice } = useStore(
    middleware.store,
    useShallow((s) => ({
      showDevices: s.settings.showDevices,
      showAddDevice: s.settings.showAddDevices,
      showEnableDevice: s.settings.showEnableDevices,
      showRemoveDevice: s.settings.showRemoveDevices,
    })),
  );

  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [qrcode, setQrcode] = useState<null | string>(null);
  const devicesSorted = useMemo(() => devices.sort((a, b) => Number(b.enable) - Number(a.enable)), [devices]);

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
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:h-[85vh] wv:max-h-[85vh] wv:sm:max-w-3xl wv:max-sm:h-[100vh] wv:max-sm:max-h-[100vh] wv:max-sm:max-w-full wv:max-sm:rounded-none wv:max-sm:p-4"
      >
        <DialogTitle className="wv:sr-only">{t("Settings")}</DialogTitle>
        <DialogDescription className="wv:sr-only">{t("Here you can configure the entire webphone")}</DialogDescription>
        <div className="wv:flex wv:w-full wv:flex-col wv:gap-6 wv:overflow-hidden">
          {qrcode && (
            <>
              <DialogHeader>
                <DialogTitle>QRCode</DialogTitle>
                <DialogDescription>{t("Point your phone camera")}</DialogDescription>
              </DialogHeader>

              <QRCode value={qrcode} level="L" className="wv:size-full"></QRCode>
            </>
          )}
          {!qrcode && (
            <Tabs defaultValue="devices" orientation="vertical" className="wv:flex-1 wv:overflow-hidden wv:flex wv:flex-col wv:max-sm:gap-3">
              <TabsList>
                {showDevices && <TabsTrigger value="devices">{t("Numbers")}</TabsTrigger>}
                {showAudio && (
                  <TabsTrigger value="settings" disabled>
                    Audio
                  </TabsTrigger>
                )}
                <TabsTrigger value="diagnostics">{t("Diagnostics")}</TabsTrigger>
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
                        placeholder={error ? error : "Token"}
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          if (error) setError("");
                        }}
                        className={`wv:focus-visible:ring-0 wv:flex-1 ${error ? "wv:border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (!token.trim()) {
                            setError(t("Enter the token"));
                            return;
                          }
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
              <TabsContent value="diagnostics" className="wv:flex-1 wv:overflow-auto">
                <DebugScreen onClose={() => setOpen(false)} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

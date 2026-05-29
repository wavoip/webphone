import { GearIcon, MicrophoneIcon, PhoneIcon, StethoscopeIcon } from "@phosphor-icons/react";
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
        className="wv:flex wv:flex-col wv:gap-0 wv:h-[85vh] wv:max-h-[85vh] wv:sm:max-w-3xl wv:p-0 wv:overflow-hidden wv:max-sm:h-[100vh] wv:max-sm:max-h-[100vh] wv:max-sm:max-w-full wv:max-sm:rounded-none"
      >
        {qrcode ? (
          <div className="wv:flex wv:flex-col wv:gap-4 wv:p-6">
            <DialogHeader>
              <DialogTitle>QRCode</DialogTitle>
              <DialogDescription>{t("Point your phone camera")}</DialogDescription>
            </DialogHeader>
            <QRCode value={qrcode} level="L" className="wv:size-full" />
          </div>
        ) : (
          <>
            <DialogHeader className="wv:px-6 wv:pt-6 wv:pb-3 wv:border-b wv:border-border wv:max-sm:px-4 wv:max-sm:pt-4">
              <DialogTitle className="wv:text-lg wv:font-semibold wv:text-foreground">{t("Settings")}</DialogTitle>
              <DialogDescription className="wv:text-sm wv:text-muted-foreground">
                {t("Here you can configure the entire webphone")}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="devices" className="wv:flex wv:flex-1 wv:flex-col wv:gap-0 wv:overflow-hidden">
              <TabsList className="wv:mx-6 wv:mt-4 wv:h-10 wv:w-auto wv:justify-start wv:max-sm:mx-4">
                {showDevices && (
                  <TabsTrigger value="devices" className="wv:gap-2">
                    <PhoneIcon className="wv:size-4" weight="duotone" />
                    {t("Numbers")}
                  </TabsTrigger>
                )}
                {showAudio && (
                  <TabsTrigger value="settings" disabled className="wv:gap-2">
                    <MicrophoneIcon className="wv:size-4" weight="duotone" />
                    Audio
                  </TabsTrigger>
                )}
                <TabsTrigger value="diagnostics" className="wv:gap-2">
                  <StethoscopeIcon className="wv:size-4" weight="duotone" />
                  {t("Diagnostics")}
                </TabsTrigger>
              </TabsList>

              {showDevices && (
                <TabsContent
                  value="devices"
                  className="wv:flex-1 wv:overflow-auto wv:flex wv:flex-col wv:gap-3 wv:px-6 wv:py-4 wv:max-sm:px-4"
                >
                  {showAddDevice && (
                    <div className="wv:flex wv:items-center wv:gap-2 wv:sticky wv:top-0 wv:bg-background wv:pb-2 wv:z-10">
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
                        className="wv:bg-green-500 wv:hover:bg-green-600 wv:h-9 wv:aspect-square wv:p-0 wv:hover:cursor-pointer"
                      >
                        <PlusIcon className="wv:size-4" />
                      </Button>
                    </div>
                  )}

                  <div className="wv:flex wv:flex-col wv:gap-2">
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
                <TabsContent value="settings" className="wv:flex-1 wv:overflow-auto wv:px-6 wv:py-4 wv:max-sm:px-4">
                  <AudioConfig />
                </TabsContent>
              )}

              <TabsContent value="diagnostics" className="wv:flex-1 wv:overflow-hidden">
                <DebugScreen onClose={() => setOpen(false)} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

import {
  ArrowLeftIcon,
  DeviceMobileIcon,
  GearIcon,
  MicrophoneIcon,
  PhoneIcon,
  QrCodeIcon,
  SlidersIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react";
import { PlusIcon } from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";
import { PreferencesConfig } from "@/components/layout/settings/PreferencesConfig";
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

  // Auto-close the QR view once the device finishes pairing (qrCode cleared
  // upstream by `device:open`). Falls back to the device list.
  useEffect(() => {
    if (!qrcode) return;
    const stillPending = devices.some((d) => d.qrCode === qrcode);
    if (!stillPending) setQrcode(null);
  }, [devices, qrcode]);

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
      <DialogTrigger
        aria-label={t("Settings")}
        className="wv:hover:cursor-pointer wv:hover:bg-background wv:text-foreground wv:hover:text-foreground wv:p-0.5 wv:rounded-full wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:max-sm:p-2 wv:focus-visible:outline-none wv:focus-visible:ring-2 wv:focus-visible:ring-ring"
      >
        <GearIcon className="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
      </DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:gap-0 wv:h-[85vh] wv:max-h-[85vh] wv:sm:max-w-3xl wv:p-0 wv:overflow-hidden wv:max-sm:h-[100vh] wv:max-sm:max-h-[100vh] wv:max-sm:max-w-full wv:max-sm:rounded-none"
      >
        {qrcode ? (
          <div className="wv:flex wv:flex-col wv:gap-5 wv:p-6 wv:overflow-y-auto wv:max-sm:p-4">
            <DialogHeader className="wv:flex-row wv:items-center wv:gap-3 wv:space-y-0 wv:text-left">
              <button
                type="button"
                aria-label={t("Back")}
                onClick={() => setQrcode(null)}
                className="wv:inline-flex wv:items-center wv:justify-center wv:size-9 wv:rounded-md wv:text-muted-foreground wv:hover:bg-accent wv:hover:text-foreground wv:hover:cursor-pointer wv:shrink-0"
              >
                <ArrowLeftIcon className="wv:size-5" />
              </button>
              <div className="wv:flex wv:flex-col wv:gap-0.5 wv:min-w-0 wv:flex-1">
                <DialogTitle className="wv:flex wv:items-center wv:gap-2 wv:text-lg wv:font-semibold wv:text-foreground">
                  <QrCodeIcon className="wv:size-5 wv:text-green-500" weight="fill" />
                  {t("Link a WhatsApp number")}
                </DialogTitle>
                <DialogDescription className="wv:text-sm wv:text-muted-foreground">
                  {t("Point your phone camera")}
                </DialogDescription>
              </div>
            </DialogHeader>

            <ol className="wv:flex wv:flex-col wv:gap-2 wv:px-1 wv:text-sm wv:text-muted-foreground">
              <li className="wv:flex wv:items-start wv:gap-2">
                <DeviceMobileIcon className="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
                <span>{t("Open WhatsApp on your phone")}</span>
              </li>
              <li className="wv:flex wv:items-start wv:gap-2">
                <GearIcon className="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
                <span>{t("Tap menu, then Linked devices")}</span>
              </li>
              <li className="wv:flex wv:items-start wv:gap-2">
                <QrCodeIcon className="wv:size-4 wv:mt-0.5 wv:text-foreground/60 wv:shrink-0" weight="fill" />
                <span>{t("Point your camera at the code below")}</span>
              </li>
            </ol>

            <div className="wv:flex wv:justify-center">
              <div className="wv:rounded-2xl wv:bg-white wv:p-4 wv:shadow-md wv:max-w-[20rem] wv:w-full">
                <QRCode value={qrcode} level="M" className="wv:size-full wv:h-auto" />
              </div>
            </div>
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
              <TabsList
                aria-label={t("Settings")}
                className="wv:mx-6 wv:mt-4 wv:h-10 wv:w-auto wv:justify-start wv:max-sm:mx-4 wv:max-sm:w-auto wv:max-sm:overflow-x-auto"
              >
                {showDevices && (
                  <TabsTrigger value="devices" className="wv:gap-2 wv:max-sm:min-h-9">
                    <PhoneIcon className="wv:size-4" weight="duotone" />
                    {t("Numbers")}
                  </TabsTrigger>
                )}
                {showAudio && (
                  <TabsTrigger value="settings" disabled className="wv:gap-2 wv:max-sm:min-h-9">
                    <MicrophoneIcon className="wv:size-4" weight="duotone" />
                    Audio
                  </TabsTrigger>
                )}
                <TabsTrigger value="preferences" className="wv:gap-2 wv:max-sm:min-h-9">
                  <SlidersIcon className="wv:size-4" weight="duotone" />
                  {t("Preferences")}
                </TabsTrigger>
                <TabsTrigger value="diagnostics" className="wv:gap-2 wv:max-sm:min-h-9">
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
                    <div className="wv:flex wv:items-center wv:gap-2 wv:sticky wv:top-0 wv:bg-background/95 wv:backdrop-blur wv:pb-2 wv:z-10">
                      <Input
                        aria-label="Token"
                        placeholder={error ? error : "Token"}
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          if (error) setError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && token.trim()) {
                            addDevice(token);
                            setToken("");
                          }
                        }}
                        className={`wv:focus-visible:ring-0 wv:flex-1 wv:max-sm:h-10 ${error ? "wv:border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        aria-label={t("Enter the token")}
                        onClick={() => {
                          if (!token.trim()) {
                            setError(t("Enter the token"));
                            return;
                          }
                          addDevice(token);
                          setToken("");
                        }}
                        className="wv:bg-green-500 wv:hover:bg-green-600 wv:h-9 wv:aspect-square wv:p-0 wv:hover:cursor-pointer wv:max-sm:h-10"
                      >
                        <PlusIcon className="wv:size-4" />
                      </Button>
                    </div>
                  )}

                  {devicesSorted.length === 0 ? (
                    <p className="wv:text-xs wv:text-muted-foreground wv:italic wv:py-4 wv:text-center">—</p>
                  ) : (
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
                  )}
                </TabsContent>
              )}

              {showAudio && (
                <TabsContent value="settings" className="wv:flex-1 wv:overflow-auto wv:px-6 wv:py-4 wv:max-sm:px-4">
                  <AudioConfig />
                </TabsContent>
              )}

              <TabsContent value="preferences" className="wv:flex-1 wv:overflow-auto wv:px-6 wv:py-4 wv:max-sm:px-4">
                <PreferencesConfig />
              </TabsContent>

              <TabsContent value="diagnostics" className="wv:flex-1 wv:overflow-hidden">
                <DebugScreen />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

import { GearIcon, InfoIcon, MicrophoneIcon, PhoneIcon } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import QRCode from "react-qr-code";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { AboutTab } from "@/components/layout/settings/AboutTab";
import { AudioConfig } from "@/components/layout/settings/AudioConfig";
import { DevicesTab } from "@/components/layout/settings/DevicesTab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { useMiddleware } from "@/middleware/react/hooks";
import { useShadowRoot } from "@/providers/ShadowRootProvider";
import { useSettings } from "@/providers/settings/Provider";

type TabDef = {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

export const SettingsModal = forwardRef(() => {
  const { root } = useShadowRoot();
  const { audio: audioMenuSettings } = useSettings();

  const middleware = useMiddleware();
  const { showDevices } = useStore(
    middleware.store,
    useShallow((s) => ({ showDevices: s.settings.showDevices })),
  );

  const [open, setOpen] = useState(false);
  const [qrcode, setQrcode] = useState<null | string>(null);

  const tabs: TabDef[] = [];
  if (showDevices) {
    tabs.push({
      value: "devices",
      label: t("Numbers"),
      description: t("Manage your WhatsApp devices"),
      icon: <PhoneIcon size={16} />,
      content: <DevicesTab setShowQRCode={setQrcode} />,
    });
  }
  if (audioMenuSettings.show) {
    tabs.push({
      value: "audio",
      label: "Audio",
      description: t("Microphone, speaker and permission settings"),
      icon: <MicrophoneIcon size={16} />,
      content: <AudioConfig />,
    });
  }
  tabs.push({
    value: "about",
    label: t("About"),
    description: t("Version and references"),
    icon: <InfoIcon size={16} />,
    content: <AboutTab />,
  });

  const defaultTab = tabs[0]?.value ?? "about";

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={(o) => {
        if (qrcode && !o) {
          setQrcode(null);
          return;
        }
        setOpen(o);
      }}
    >
      <DialogTrigger className="wv:hover:cursor-pointer wv:hover:bg-background wv:text-foreground wv:hover:text-foreground wv:p-0.5 wv:rounded-full wv:active:bg-[#D9D9DD] wv:transition-colors wv:duration-200 wv:touch-manipulation wv:max-sm:p-2">
        <GearIcon className="wv:max-sm:size-6 wv:max-sm:text-blue wv:pointer-events-none" />
      </DialogTrigger>
      <DialogContent
        container={root}
        onClick={(e) => e.stopPropagation()}
        className="wv:flex wv:flex-col wv:p-0 wv:gap-0 wv:max-w-[720px] wv:w-[90vw] wv:h-[80vh] wv:max-h-[640px] wv:max-sm:max-w-none wv:max-sm:w-screen wv:max-sm:h-screen wv:max-sm:max-h-none wv:max-sm:rounded-none"
      >
        <DialogHeader className="wv:px-5 wv:py-4 wv:border-b wv:border-foreground/10">
          <DialogTitle>{t("Settings")}</DialogTitle>
          <DialogDescription>{t("Here you can configure the entire webphone")}</DialogDescription>
        </DialogHeader>

        {qrcode ? (
          <div className="wv:flex wv:flex-col wv:gap-3 wv:p-5 wv:overflow-auto">
            <div>
              <h2 className="wv:text-base wv:font-medium">QRCode</h2>
              <p className="wv:text-sm wv:text-foreground/60">{t("Point your phone camera")}</p>
            </div>
            <QRCode value={qrcode} level="L" className="wv:size-full wv:max-h-[400px]" />
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="wv:flex wv:flex-1 wv:overflow-hidden wv:max-sm:flex-col">
            <TabsList className="wv:flex wv:flex-col wv:items-stretch wv:gap-1 wv:w-[180px] wv:p-3 wv:bg-foreground/[0.03] wv:border-r wv:border-foreground/10 wv:max-sm:flex-row wv:max-sm:w-full wv:max-sm:border-r-0 wv:max-sm:border-b wv:max-sm:overflow-x-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="wv:flex wv:items-center wv:gap-2 wv:justify-start wv:px-3 wv:py-2 wv:text-sm wv:rounded-md wv:data-[state=active]:bg-background wv:data-[state=active]:shadow-sm wv:hover:bg-foreground/5 wv:max-sm:flex-1"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="wv:flex-1 wv:overflow-auto wv:p-5 wv:data-[state=inactive]:hidden"
              >
                <div className="wv:flex wv:flex-col wv:gap-4 wv:h-full">
                  <div>
                    <h2 className="wv:text-base wv:font-medium wv:text-foreground">{tab.label}</h2>
                    <p className="wv:text-sm wv:text-foreground/60">{tab.description}</p>
                  </div>
                  <div className="wv:flex-1 wv:overflow-auto">{tab.content}</div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
});

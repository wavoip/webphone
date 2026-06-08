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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
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

  const [activeTab, setActiveTab] = useState(tabs[0]?.value ?? "about");
  const active = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];

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
        className="wv:flex wv:flex-col wv:p-0 wv:gap-0 wv:max-w-[1000px] wv:w-[96vw] wv:h-[90vh] wv:max-h-[780px] wv:max-sm:max-w-none wv:max-sm:w-screen wv:max-sm:h-screen wv:max-sm:max-h-none wv:max-sm:rounded-none"
      >
        <DialogHeader className="wv:px-5 wv:py-4 wv:border-b wv:border-foreground/10">
          <DialogTitle className="wv:text-foreground">{t("Settings")}</DialogTitle>
          <DialogDescription className="wv:text-foreground/60">
            {t("Here you can configure the entire webphone")}
          </DialogDescription>
        </DialogHeader>

        {qrcode ? (
          <div className="wv:flex wv:flex-col wv:items-center wv:gap-4 wv:p-6 wv:overflow-auto">
            <div className="wv:text-center">
              <h2 className="wv:text-base wv:font-medium wv:text-foreground">QR Code</h2>
              <p className="wv:text-sm wv:text-foreground/60">{t("Point your phone camera")}</p>
            </div>
            <div className="wv:bg-white wv:p-4 wv:rounded-lg wv:shadow-md">
              <QRCode value={qrcode} level="M" size={280} className="wv:size-full wv:max-w-[320px]" />
            </div>
            <p className="wv:text-xs wv:text-foreground/60 wv:text-center wv:max-w-[400px]">
              {t("Open WhatsApp on your phone, go to Settings > Linked Devices and scan this code")}
            </p>
          </div>
        ) : (
          <SidebarProvider
            className="wv:flex-1 wv:min-h-0 wv:items-stretch wv:overflow-hidden"
            style={{ "--sidebar-width": "200px" } as React.CSSProperties}
          >
            <Sidebar collapsible="none" className="wv:border-r wv:border-foreground/10">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {tabs.map((tab) => (
                        <SidebarMenuItem key={tab.value}>
                          <SidebarMenuButton isActive={activeTab === tab.value} onClick={() => setActiveTab(tab.value)}>
                            {tab.icon}
                            <span>{tab.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <main className="wv:flex-1 wv:overflow-auto wv:p-5">
              <div className="wv:flex wv:flex-col wv:gap-4 wv:h-full">
                <div>
                  <h2 className="wv:text-base wv:font-medium wv:text-foreground">{active.label}</h2>
                  <p className="wv:text-sm wv:text-foreground/60">{active.description}</p>
                </div>
                <div className="wv:flex-1 wv:overflow-auto">{active.content}</div>
              </div>
            </main>
          </SidebarProvider>
        )}
      </DialogContent>
    </Dialog>
  );
});

import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
// import { AppSidebar } from "@/components/layout/sidebar/Sidebar";
// import { SidebarProvider } from "@/components/ui/sidebar";
import TabBar from "@/layout/TabBar";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";
import { LoginScreen } from "@/screens/LoginScreen";

type Props = {
  shadowRoot: ShadowRoot;
};

export function App({ shadowRoot }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  return (
    <ShadowRootContext.Provider value={shadowRoot}>
      <SettingsProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <WidgetProvider>
            <NotificationsProvider>
              <ScreenProvider>
                <WavoipProvider wavoip={wavoip}>
                  {/* <SidebarProvider>
                    <AppSidebar />
                  </SidebarProvider> */}
                  {true ? (
                    <LoginScreen />
                  ) : (
                    <TabBar />
                  )}
                </WavoipProvider>
              </ScreenProvider>
            </NotificationsProvider>
          </WidgetProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ShadowRootContext.Provider>
  );
}

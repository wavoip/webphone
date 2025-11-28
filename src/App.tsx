import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

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
            <ScreenProvider>
              <WavoipProvider wavoip={wavoip}>
                <NotificationsProvider>
                  <WebPhone />
                </NotificationsProvider>
              </WavoipProvider>
            </ScreenProvider>
          </WidgetProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ShadowRootContext.Provider>
  );
}

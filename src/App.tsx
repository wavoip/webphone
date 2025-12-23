import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { type AppConfig, SettingsProvider } from "@/providers/SettingsProvider";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  shadowRoot: ShadowRoot;
  config: AppConfig;
};

export function App({ shadowRoot, config }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  return (
    <ShadowRootContext.Provider value={shadowRoot}>
      <SettingsProvider config={config}>
        <ThemeProvider defaultTheme={config.theme} storageKey="webphone-ui-theme">
          <WidgetProvider config={config}>
            <NotificationsProvider>
              <ScreenProvider>
                <WavoipProvider wavoip={wavoip}>
                  <WebPhone />
                </WavoipProvider>
              </ScreenProvider>
            </NotificationsProvider>
          </WidgetProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ShadowRootContext.Provider>
  );
}

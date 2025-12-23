import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { type AppConfig, SettingsProvider } from "@/providers/SettingsProvider";
import { ShadowProvider } from "@/providers/ShadowRootProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  config: AppConfig;
};

export function App({ shadowRoot, root, config }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <ThemeProvider root={root} defaultTheme={config.theme} storageKey="webphone-ui-theme">
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
    </ShadowProvider>
  );
}

import { Wavoip } from "@wavoip/wavoip-api";
import { useState } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getSettings } from "@/lib/device-settings";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { ScreenProvider } from "@/providers/ScreenProvider";
import { ShadowProvider } from "@/providers/ShadowRootProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
  config: WebphoneSettings;
};

export function App({ shadowRoot, root, config }: Props) {
  const [wavoip] = useState(() => new Wavoip({ tokens: [...getSettings().keys()] }));

  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <ThemeProvider root={root} defaultTheme={config.theme} storageKey="webphone-ui-theme">
          <WidgetProvider>
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

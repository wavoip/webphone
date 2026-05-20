import type { Wavoip } from "@wavoip/wavoip-api";
import { WebPhone } from "@/components/WebPhone";
import { MiddlewareRoot } from "@/middleware/react/MiddlewareRoot";
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
  wavoip?: Wavoip;
};

export function App({ shadowRoot, root, config, wavoip }: Props) {
  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <MiddlewareRoot wavoip={wavoip}>
          <ThemeProvider root={root} defaultTheme={config.theme} storageKey="webphone-ui-theme">
            <WidgetProvider>
              <NotificationsProvider>
                <ScreenProvider>
                  <WavoipProvider>
                    <WebPhone />
                  </WavoipProvider>
                </ScreenProvider>
              </NotificationsProvider>
            </WidgetProvider>
          </ThemeProvider>
        </MiddlewareRoot>
      </SettingsProvider>
    </ShadowProvider>
  );
}

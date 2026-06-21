import type { Wavoip } from "@wavoip/wavoip-api";
import { useSyncExternalStore } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getLanguage, normalizeLanguage, subscribeLocale } from "@/lib/i18n";
import { MiddlewareRoot } from "@/middleware/react/MiddlewareRoot";
import { DebugProvider } from "@/providers/DebugProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
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
  useSyncExternalStore(
    subscribeLocale,
    () => normalizeLanguage(getLanguage()),
    () => normalizeLanguage(config.language),
  );
  return (
    <ShadowProvider shadowRoot={shadowRoot} root={root}>
      <SettingsProvider config={config}>
        <MiddlewareRoot wavoip={wavoip} config={config}>
          <LanguageProvider initial={config.language}>
            <ThemeProvider root={root}>
              <WidgetProvider>
                <NotificationsProvider>
                  <WavoipProvider>
                    <DebugProvider>
                      <WebPhone />
                    </DebugProvider>
                  </WavoipProvider>
                </NotificationsProvider>
              </WidgetProvider>
            </ThemeProvider>
          </LanguageProvider>
        </MiddlewareRoot>
      </SettingsProvider>
    </ShadowProvider>
  );
}

import { EnvironmentProvider } from "@ark-ui/react/environment";
import type { Wavoip } from "@wavoip/wavoip-api/web";
import { useSyncExternalStore } from "react";
import { WebPhone } from "@/components/WebPhone";
import { getLanguage, normalizeLanguage, subscribeLocale } from "@/lib/i18n";
import { MiddlewareRoot } from "@/middleware/react/MiddlewareRoot";
import { DebugProvider } from "@/providers/DebugProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { type Mount, MountProvider } from "@/providers/MountProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { PipProvider } from "@/providers/PipProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  layout: Mount["layout"];
  root: HTMLDivElement;
  rootNode: Mount["rootNode"];
  config: WebphoneSettings;
  wavoip?: Wavoip;
};

export function App({ layout, root, rootNode, config, wavoip }: Props) {
  useSyncExternalStore(
    subscribeLocale,
    () => normalizeLanguage(getLanguage()),
    () => normalizeLanguage(config.language),
  );
  return (
    // O Ark consulta o DOM por `getRootNode()`: sem isto ele procuraria no `document` e
    // não acharia nada do que vive dentro do shadow root fechado do widget.
    <EnvironmentProvider value={rootNode}>
      <MountProvider layout={layout} root={root} rootNode={rootNode}>
        <SettingsProvider config={config}>
          <MiddlewareRoot wavoip={wavoip} config={config}>
            <LanguageProvider initial={config.language}>
              <ThemeProvider root={root}>
                <PipProvider rootNode={rootNode}>
                  <WidgetProvider>
                    <NotificationsProvider>
                      <WavoipProvider>
                        <DebugProvider>
                          <WebPhone />
                        </DebugProvider>
                      </WavoipProvider>
                    </NotificationsProvider>
                  </WidgetProvider>
                </PipProvider>
              </ThemeProvider>
            </LanguageProvider>
          </MiddlewareRoot>
        </SettingsProvider>
      </MountProvider>
    </EnvironmentProvider>
  );
}

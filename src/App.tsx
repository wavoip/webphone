import { EnvironmentProvider } from "@ark-ui/solid/environment";
import type { Wavoip } from "@wavoip/wavoip-api/web";
import { WebPhone } from "@/components/WebPhone";
import { MiddlewareRoot } from "@/middleware/solid/MiddlewareRoot";
import { DebugProvider } from "@/providers/DebugProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { type Mount, MountProvider } from "@/providers/MountProvider";
import { PipProvider } from "@/providers/PipProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  layout: Mount["layout"];
  root: HTMLDivElement;
  rootNode: Mount["rootNode"];
  config: WebphoneSettings;
  wavoip?: Wavoip;
};

export function App(props: Props) {
  return (
    // O Ark consulta o DOM por `getRootNode()`: sem isto ele procuraria no `document` e
    // não acharia nada do que vive dentro do shadow root fechado do widget.
    <EnvironmentProvider value={props.rootNode}>
      <MountProvider layout={props.layout} root={props.root} rootNode={props.rootNode}>
        <SettingsProvider config={props.config}>
          <MiddlewareRoot wavoip={props.wavoip} config={props.config}>
            <LanguageProvider initial={props.config.language}>
              <ThemeProvider root={props.root}>
                <PipProvider rootNode={props.rootNode}>
                  <WidgetProvider>
                    <DebugProvider>
                      <WebPhone />
                    </DebugProvider>
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

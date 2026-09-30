import { EnvironmentProvider } from "@ark-ui/solid/environment";
import type { Wavoip } from "@wavoip/wavoip-api/web";
import { WebPhone } from "@/components/WebPhone";
import { MiddlewareRoot } from "@/middleware/solid/MiddlewareRoot";
import { DebugProvider } from "@/providers/DebugProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { type Surface, SurfaceProvider, useSurface } from "@/providers/SurfaceProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type Props = {
  layout: Surface["layout"];
  root: HTMLDivElement;
  rootNode: ShadowRoot | Document;
  config: WebphoneSettings;
  wavoip?: Wavoip;
};

/**
 * O Ark consulta o DOM por `getRootNode()`, e aceita função — então ele acompanha a
 * superfície ativa. Sem isto procuraria no `document` da página: não acharia nada do que
 * vive dentro do shadow root fechado do widget, nem do que está na janela do PiP.
 */
function ArkEnvironment(props: { children: Parameters<typeof EnvironmentProvider>[0]["children"] }) {
  const { rootNode } = useSurface();
  return <EnvironmentProvider value={rootNode}>{props.children}</EnvironmentProvider>;
}

export function App(props: Props) {
  return (
    <SurfaceProvider layout={props.layout} root={props.root} rootNode={props.rootNode}>
      <ArkEnvironment>
        <SettingsProvider config={props.config}>
          <MiddlewareRoot wavoip={props.wavoip} config={props.config}>
            <LanguageProvider initial={props.config.language}>
              <ThemeProvider root={props.root}>
                <WidgetProvider>
                  <DebugProvider>
                    <WebPhone />
                  </DebugProvider>
                </WidgetProvider>
              </ThemeProvider>
            </LanguageProvider>
          </MiddlewareRoot>
        </SettingsProvider>
      </ArkEnvironment>
    </SurfaceProvider>
  );
}

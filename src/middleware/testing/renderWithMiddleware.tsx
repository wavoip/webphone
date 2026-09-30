import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { resetForTesting, webphoneAPIPromise } from "@/lib/webphone-api/api";
import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";
import type { FocusTracker } from "@/middleware/browser/focusTracker";
import type { BrowserNotifier } from "@/middleware/browser/notifier";
import { MiddlewareRoot } from "@/middleware/solid/MiddlewareRoot";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { DebugProvider } from "@/providers/DebugProvider";
import { SurfaceProvider } from "@/providers/SurfaceProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type MountOptions = {
  wavoip?: FakeWavoip;
  config?: WebphoneSettings;
  /**
   * Função, e não JSX pronto: no Solid o JSX vira DOM na hora em que é escrito, e um
   * elemento criado antes do `render` nasce fora da árvore — sem contexto nenhum.
   */
  children?: () => JSX.Element;
  notifier?: BrowserNotifier;
  focus?: FocusTracker;
};

/**
 * Chame {@link resetPublicApiBetweenTests} no `beforeEach`: o estado de módulo do
 * `api.ts` vaza de um teste para o outro.
 */
export async function renderWithMiddleware(options: MountOptions = {}): Promise<{
  rendered: ReturnType<typeof render>;
  wavoip: FakeWavoip;
  api: WebphoneAPI;
}> {
  const fake = options.wavoip ?? new FakeWavoip();
  const rendered = render(() => (
    <SettingsProvider config={options.config ?? {}}>
      <MiddlewareRoot wavoip={fake.asWavoip()} notifier={options.notifier} focus={options.focus}>
        {options.children?.()}
      </MiddlewareRoot>
    </SettingsProvider>
  ));
  const api = await webphoneAPIPromise();
  return { rendered, wavoip: fake, api };
}

export function resetPublicApiBetweenTests(): void {
  resetForTesting();
}

/**
 * A pilha de providers do `<App>`, menos o shadow DOM, para os seeders da config dentro
 * dos providers rodarem de verdade.
 */
export async function renderWithProviders(options: MountOptions = {}): Promise<{
  rendered: ReturnType<typeof render>;
  wavoip: FakeWavoip;
  api: WebphoneAPI;
}> {
  const fake = options.wavoip ?? new FakeWavoip();
  const root = document.createElement("div");
  document.body.appendChild(root);
  const shadowHost = document.createElement("div");
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  const rendered = render(() => (
    <SurfaceProvider layout="floating" root={root} rootNode={shadowRoot}>
      <SettingsProvider config={options.config ?? {}}>
        <MiddlewareRoot
          wavoip={fake.asWavoip()}
          config={options.config ?? {}}
          notifier={options.notifier}
          focus={options.focus}
        >
          <ThemeProvider root={root}>
            <WidgetProvider>
              <DebugProvider>{options.children?.()}</DebugProvider>
            </WidgetProvider>
          </ThemeProvider>
        </MiddlewareRoot>
      </SettingsProvider>
    </SurfaceProvider>
  ));
  const api = await webphoneAPIPromise();
  return { rendered, wavoip: fake, api };
}

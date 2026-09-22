import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { resetForTesting, webphoneAPIPromise } from "@/lib/webphone-api/api";
import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";
import type { FocusTracker } from "@/middleware/browser/focusTracker";
import type { BrowserNotifier } from "@/middleware/browser/notifier";
import { MiddlewareRoot } from "@/middleware/react/MiddlewareRoot";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { PipProvider } from "@/providers/PipProvider";
import { ShadowRootContext } from "@/providers/ShadowRootProvider";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { WavoipProvider } from "@/providers/WavoipProvider";
import { WidgetProvider } from "@/providers/WidgetProvider";

type MountOptions = {
  wavoip?: FakeWavoip;
  config?: WebphoneSettings;
  children?: ReactNode;
  notifier?: BrowserNotifier;
  focus?: FocusTracker;
};

/**
 * Chame {@link resetPublicApiBetweenTests} no `beforeEach`: o estado de módulo do
 * `api.ts` vaza de um teste para o outro.
 */
export async function renderWithMiddleware(options: MountOptions = {}): Promise<{
  rendered: RenderResult;
  wavoip: FakeWavoip;
  api: WebphoneAPI;
}> {
  const fake = options.wavoip ?? new FakeWavoip();
  const rendered = render(
    <SettingsProvider config={options.config ?? {}}>
      <MiddlewareRoot wavoip={fake.asWavoip()} notifier={options.notifier} focus={options.focus}>
        {options.children ?? null}
      </MiddlewareRoot>
    </SettingsProvider>,
  );
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
  rendered: RenderResult;
  wavoip: FakeWavoip;
  api: WebphoneAPI;
}> {
  const fake = options.wavoip ?? new FakeWavoip();
  const root = document.createElement("div");
  document.body.appendChild(root);
  const shadowHost = document.createElement("div");
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  const rendered = render(
    <ShadowRootContext.Provider value={{ shadowRoot, root }}>
      <SettingsProvider config={options.config ?? {}}>
        <MiddlewareRoot
          wavoip={fake.asWavoip()}
          config={options.config ?? {}}
          notifier={options.notifier}
          focus={options.focus}
        >
          <ThemeProvider root={root}>
            <PipProvider shadowRoot={shadowRoot}>
              <WidgetProvider>
                <NotificationsProvider>
                  {/* As telas chegam ao SDK pelo `useWavoip`, então sem a ponte nenhuma
                      renderiza aqui. */}
                  <WavoipProvider>{options.children ?? null}</WavoipProvider>
                </NotificationsProvider>
              </WidgetProvider>
            </PipProvider>
          </ThemeProvider>
        </MiddlewareRoot>
      </SettingsProvider>
    </ShadowRootContext.Provider>,
  );
  const api = await webphoneAPIPromise();
  return { rendered, wavoip: fake, api };
}

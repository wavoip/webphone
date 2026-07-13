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
import { WidgetProvider } from "@/providers/WidgetProvider";

type MountOptions = {
  wavoip?: FakeWavoip;
  config?: WebphoneSettings;
  children?: ReactNode;
  notifier?: BrowserNotifier;
  focus?: FocusTracker;
};

/**
 * Mounts the minimum provider tree needed to exercise the public API:
 * `SettingsProvider` + `MiddlewareRoot`. Returns the {@link RenderResult},
 * the {@link FakeWavoip} (if one was not injected) and the resolved public
 * API. Use this to write React-tree integration tests that drive
 * `window.wavoip.*` without spinning up the full `<App>` tree.
 *
 * Call {@link resetPublicApiBetweenTests} in `beforeEach` so module-scoped
 * state in `api.ts` does not bleed across tests.
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

/** Resets the singleton public-API state. Call in `beforeEach`. */
export function resetPublicApiBetweenTests(): void {
  resetForTesting();
}

/**
 * Mounts the full React provider stack used by `<App>` (minus the shadow DOM
 * boundary) so config-driven seeders inside `ThemeProvider`/`WidgetProvider`
 * etc. actually run. Use this for tests that exercise `webphone.render(config)`
 * behavior end-to-end at the provider level.
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
                <NotificationsProvider>{options.children ?? null}</NotificationsProvider>
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

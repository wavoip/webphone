import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { resetForTesting, webphoneAPIPromise } from "@/lib/webphone-api/api";
import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";
import { MiddlewareRoot } from "@/middleware/react/MiddlewareRoot";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { SettingsProvider } from "@/providers/settings/Provider";
import type { WebphoneSettings } from "@/providers/settings/settings";

type MountOptions = {
  wavoip?: FakeWavoip;
  config?: WebphoneSettings;
  children?: ReactNode;
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
      <MiddlewareRoot wavoip={fake.asWavoip()}>{options.children ?? null}</MiddlewareRoot>
    </SettingsProvider>,
  );
  const api = await webphoneAPIPromise();
  return { rendered, wavoip: fake, api };
}

/** Resets the singleton public-API state. Call in `beforeEach`. */
export function resetPublicApiBetweenTests(): void {
  resetForTesting();
}

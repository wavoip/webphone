import { bootCallAdapter } from "@/lib/webphone-api/acl/adapters/call.adapter";
import { bootDeviceAdapter } from "@/lib/webphone-api/acl/adapters/device.adapter";
import { bootNotificationsAdapter } from "@/lib/webphone-api/acl/adapters/notifications.adapter";
import { bootSettingsAdapter } from "@/lib/webphone-api/acl/adapters/settings.adapter";
import { bootThemeAdapter } from "@/lib/webphone-api/acl/adapters/theme.adapter";
import { bootWidgetAdapter } from "@/lib/webphone-api/acl/adapters/widget.adapter";
import { bus } from "@/lib/webphone-api/bus";
import type { Wavoip } from "@/lib/webphone-api/sdk-types";
import type { WebphoneSettings } from "@/providers/settings/settings";

type BootConfig = {
  wavoip: Wavoip;
  root: HTMLElement;
  config: WebphoneSettings;
  themeStorageKey?: string;
};

/**
 * Wires the wavoip-api SDK instance and UI-side adapters into the bus.
 *
 * Each domain adapter (theme, widget, settings, notifications, device, call)
 * registers its event listeners, request handlers, and query getters here.
 * Once all adapters are wired, `acl.ready` fires so the public facade can
 * resolve `webphoneAPIPromise`.
 */
let cachedTeardown: (() => void) | null = null;

export function bootACL({ wavoip, root, config, themeStorageKey }: BootConfig): () => void {
  if (cachedTeardown) return cachedTeardown;

  const teardowns: Array<() => void> = [];

  teardowns.push(
    bootThemeAdapter({
      root,
      defaultTheme: config.theme,
      storageKey: themeStorageKey,
    }),
    bootWidgetAdapter({ startOpen: config.widget?.startOpen }),
    bootSettingsAdapter(config),
    bootNotificationsAdapter(),
    bootDeviceAdapter(wavoip),
    bootCallAdapter({ wavoip, callSettings: config.callSettings }),
  );

  bus.emit("acl.ready", undefined);

  cachedTeardown = () => {
    for (const teardown of teardowns.reverse()) teardown();
    bus.reset();
    cachedTeardown = null;
  };
  return cachedTeardown;
}

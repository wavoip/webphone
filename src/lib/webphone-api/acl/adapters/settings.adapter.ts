import { bus } from "@/lib/webphone-api/bus";
import type { WebphoneSettings } from "@/providers/settings/settings";

type Flags = {
  showNotifications: boolean;
  showSettings: boolean;
  showDevices: boolean;
  showAddDevices: boolean;
  showEnableDevices: boolean;
  showRemoveDevices: boolean;
  showWidgetButton: boolean;
};

function resolveInitialFlags(config: WebphoneSettings): Flags {
  const deviceMenu = config.settingsMenu?.deviceMenu;
  return {
    showNotifications: config.statusBar?.showNotificationsIcon ?? true,
    showSettings: config.statusBar?.showSettingsIcon ?? true,
    showDevices: deviceMenu?.show || true,
    showAddDevices: deviceMenu?.showAddDevices ?? true,
    showEnableDevices: deviceMenu?.showEnableDevicesButton ?? true,
    showRemoveDevices: deviceMenu?.showRemoveDevicesButton ?? true,
    showWidgetButton: config.widget?.showWidgetButton ?? true,
  };
}

export function bootSettingsAdapter(config: WebphoneSettings): () => void {
  const flags = resolveInitialFlags(config);

  const emit = () => bus.emit("settings.changed", { ...flags });

  function set<K extends keyof Flags>(key: K, value: boolean): void {
    if (flags[key] === value) return;
    flags[key] = value;
    emit();
  }

  const unsubs: Array<() => void> = [
    bus.registerQuery("settings.showNotifications", () => flags.showNotifications),
    bus.registerQuery("settings.showSettings", () => flags.showSettings),
    bus.registerQuery("settings.showDevices", () => flags.showDevices),
    bus.registerQuery("settings.showAddDevices", () => flags.showAddDevices),
    bus.registerQuery("settings.showEnableDevices", () => flags.showEnableDevices),
    bus.registerQuery("settings.showRemoveDevices", () => flags.showRemoveDevices),
    bus.registerQuery("settings.showWidgetButton", () => flags.showWidgetButton),

    bus.handle("settings.setShowNotifications", async ({ value }) => set("showNotifications", value)),
    bus.handle("settings.setShowSettings", async ({ value }) => set("showSettings", value)),
    bus.handle("settings.setShowDevices", async ({ value }) => set("showDevices", value)),
    bus.handle("settings.setShowAddDevices", async ({ value }) => set("showAddDevices", value)),
    bus.handle("settings.setShowEnableDevices", async ({ value }) => set("showEnableDevices", value)),
    bus.handle("settings.setShowRemoveDevices", async ({ value }) => set("showRemoveDevices", value)),
    bus.handle("settings.setShowWidgetButton", async ({ value }) => set("showWidgetButton", value)),
  ];

  emit();

  return () => {
    for (const u of unsubs.reverse()) u();
  };
}

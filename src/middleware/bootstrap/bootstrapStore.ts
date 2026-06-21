import { resolveWebphonePosition, resolveWidgetButtonPosition } from "@/lib/widget-position";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Theme, WebphoneSettings } from "@/providers/settings/settings";

const THEME_STORAGE_KEY = "webphone-ui-theme";

type Deps = { store: MiddlewareStoreApi; config: WebphoneSettings };

/**
 * Seeds the middleware store from the `webphone.render(config)` payload before
 * any React component mounts. Centralizes settings → store mapping so each
 * provider stays a pure reader and timing/mount-order bugs disappear.
 */
export function bootstrapStore({ store, config }: Deps): void {
  const state = store.getState();
  seedSettings(state.setSetting, config);
  seedTheme(state.setTheme, config.theme);
  seedWidget(state, config);
}

type SetSetting = MiddlewareStoreApi extends { getState: () => infer S }
  ? S extends { setSetting: infer F }
    ? F
    : never
  : never;

function seedSettings(setSetting: SetSetting, config: WebphoneSettings): void {
  setSetting("showNotifications", config.statusBar?.showNotificationsIcon ?? true);
  setSetting("showSettings", config.statusBar?.showSettingsIcon ?? true);
  const dm = config.settingsMenu?.deviceMenu;
  setSetting("showDevices", dm?.show ?? true);
  setSetting("showAddDevices", dm?.showAddDevices ?? true);
  setSetting("showEnableDevices", dm?.showEnableDevicesButton ?? true);
  setSetting("showRemoveDevices", dm?.showRemoveDevicesButton ?? true);
  setSetting("showWidgetButton", config.widget?.showWidgetButton ?? true);
}

function seedTheme(setTheme: (theme: Theme) => void, configured?: Theme): void {
  const stored = (typeof localStorage !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY)) as Theme | null;
  setTheme(stored ?? configured ?? "system");
}

type StoreState = ReturnType<MiddlewareStoreApi["getState"]>;

function seedWidget(state: StoreState, config: WebphoneSettings): void {
  if (config.widget?.startOpen) state.openWidget();
  else state.closeWidget();
  if (config.position) state.setWidgetPosition(resolveWebphonePosition(config.position));
  if (config.buttonPosition) state.setButtonPosition(resolveWidgetButtonPosition(config.buttonPosition));
}

import { beforeEach, describe, expect, it } from "vitest";
import { bootstrapStore } from "@/middleware/bootstrap/bootstrapStore";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("bootstrapStore", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
    localStorage.clear();
  });

  it("seeds settings flags with the configured values", () => {
    bootstrapStore({
      store,
      config: {
        statusBar: { showNotificationsIcon: false, showSettingsIcon: false },
        settingsMenu: {
          deviceMenu: {
            show: false,
            showAddDevices: false,
            showEnableDevicesButton: false,
            showRemoveDevicesButton: false,
          },
        },
        widget: { showWidgetButton: false },
      },
    });
    const s = store.getState().settings;
    expect(s.showNotifications).toBe(false);
    expect(s.showSettings).toBe(false);
    expect(s.showDevices).toBe(false);
    expect(s.showAddDevices).toBe(false);
    expect(s.showEnableDevices).toBe(false);
    expect(s.showRemoveDevices).toBe(false);
    expect(s.showWidgetButton).toBe(false);
  });

  it("defaults settings flags to true when the config is empty", () => {
    bootstrapStore({ store, config: {} });
    const s = store.getState().settings;
    expect(s.showNotifications).toBe(true);
    expect(s.showSettings).toBe(true);
    expect(s.showDevices).toBe(true);
    expect(s.showAddDevices).toBe(true);
    expect(s.showEnableDevices).toBe(true);
    expect(s.showRemoveDevices).toBe(true);
    expect(s.showWidgetButton).toBe(true);
  });

  it("seeds theme from localStorage when present", () => {
    localStorage.setItem("webphone-ui-theme", "dark");
    bootstrapStore({ store, config: { theme: "light" } });
    expect(store.getState().theme).toBe("dark");
  });

  it("seeds theme from config when localStorage is empty", () => {
    bootstrapStore({ store, config: { theme: "light" } });
    expect(store.getState().theme).toBe("light");
  });

  it("seeds theme to 'system' when neither localStorage nor config is set", () => {
    bootstrapStore({ store, config: {} });
    expect(store.getState().theme).toBe("system");
  });

  it("widget.startOpen=true opens the widget", () => {
    bootstrapStore({ store, config: { widget: { startOpen: true } } });
    expect(store.getState().isClosed).toBe(false);
  });

  it("widget.startOpen=false (default) keeps the widget closed", () => {
    bootstrapStore({ store, config: {} });
    expect(store.getState().isClosed).toBe(true);
  });

  it("resolves position keyword to coordinates", () => {
    bootstrapStore({ store, config: { buttonPosition: "top-left" } });
    expect(store.getState().buttonPosition).toEqual({ x: 20, y: 20 });
  });
});

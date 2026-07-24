import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("uiSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts on keyboard screen with system theme", () => {
    const s = store.getState();
    expect(s.screen).toBe("keyboard");
    expect(s.theme).toBe("system");
  });

  it("settings flags default to true", () => {
    const s = store.getState().settings;
    expect(s.showNotifications).toBe(true);
    expect(s.showSettings).toBe(true);
    expect(s.showDevices).toBe(true);
    expect(s.showAddDevices).toBe(true);
    expect(s.showEnableDevices).toBe(true);
    expect(s.showRemoveDevices).toBe(true);
    expect(s.showWidgetButton).toBe(true);
  });

  it("setScreen swaps the active screen", () => {
    store.getState().setScreen("outgoing");
    expect(store.getState().screen).toBe("outgoing");
    store.getState().setScreen("call");
    expect(store.getState().screen).toBe("call");
  });

  it("setTheme swaps theme", () => {
    store.getState().setTheme("dark");
    expect(store.getState().theme).toBe("dark");
    store.getState().setTheme("light");
    expect(store.getState().theme).toBe("light");
  });

  it("setSetting toggles a single flag without touching others", () => {
    store.getState().setSetting("showNotifications", false);
    const s = store.getState().settings;
    expect(s.showNotifications).toBe(false);
    expect(s.showSettings).toBe(true);
    expect(s.showWidgetButton).toBe(true);
  });

  it("recentNumbers starts empty", () => {
    expect(store.getState().recentNumbers).toEqual([]);
  });

  it("pushRecentNumber prepends most-recent-first", () => {
    store.getState().pushRecentNumber("111");
    store.getState().pushRecentNumber("222");
    expect(store.getState().recentNumbers).toEqual(["222", "111"]);
  });

  it("pushRecentNumber de-duplicates, moving an existing number to the front", () => {
    store.getState().pushRecentNumber("111");
    store.getState().pushRecentNumber("222");
    store.getState().pushRecentNumber("111");
    expect(store.getState().recentNumbers).toEqual(["111", "222"]);
  });

  it("pushRecentNumber caps the list at 8, dropping the oldest", () => {
    for (const n of ["1", "2", "3", "4", "5", "6", "7", "8", "9"]) store.getState().pushRecentNumber(n);
    expect(store.getState().recentNumbers).toEqual(["9", "8", "7", "6", "5", "4", "3", "2"]);
  });
});

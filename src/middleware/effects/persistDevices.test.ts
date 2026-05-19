import { beforeEach, describe, expect, it } from "vitest";
import { persistDevicesEffect } from "@/middleware/effects/persistDevices";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

const STORAGE_KEY = "wavoip:tokens";

describe("persistDevicesEffect", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("writes persisted devices to localStorage on change", () => {
    const unsub = persistDevicesEffect({ store });
    store.getState().setDevices([
      { token: "a", status: "open", enable: true, persist: true },
      { token: "b", status: "open", enable: false, persist: false },
    ]);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("a:true:true");
    unsub();
  });

  it("ignores devices with persist=false", () => {
    const unsub = persistDevicesEffect({ store });
    store.getState().setDevices([{ token: "a", status: "open", enable: true, persist: false }]);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("");
    unsub();
  });

  it("unsub stops further writes", () => {
    const unsub = persistDevicesEffect({ store });
    store.getState().setDevices([{ token: "a", status: "open", enable: true, persist: true }]);
    unsub();

    store.getState().setDevices([{ token: "b", status: "open", enable: true, persist: true }]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("a:true:true");
  });
});

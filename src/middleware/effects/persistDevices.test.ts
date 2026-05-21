import { beforeEach, describe, expect, it } from "vitest";
import { DeviceController } from "@/middleware/controllers/DeviceController";
import { persistDevicesEffect } from "@/middleware/effects/persistDevices";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";

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

  it("DeviceController.add(token, true) writes the token to localStorage through the effect", () => {
    const wavoip = new FakeWavoip();
    const controller = new DeviceController({ wavoip: wavoip.asWavoip(), store });
    const unsub = persistDevicesEffect({ store });

    controller.add("tok-x", true);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("tok-x:false:true");
    unsub();
  });

  it("DeviceController.add(token) without persist does not write to localStorage", () => {
    const wavoip = new FakeWavoip();
    const controller = new DeviceController({ wavoip: wavoip.asWavoip(), store });
    const unsub = persistDevicesEffect({ store });

    controller.add("tok-x");

    expect(localStorage.getItem(STORAGE_KEY)).toBe("");
    unsub();
  });

  it("end-to-end: persist then hydrate restores the device", () => {
    // Round 1: add with persist
    const wavoipA = new FakeWavoip();
    const storeA = createMiddlewareStore();
    const controllerA = new DeviceController({ wavoip: wavoipA.asWavoip(), store: storeA });
    const unsubA = persistDevicesEffect({ store: storeA });
    controllerA.add("tok-y", true);
    unsubA();

    // Round 2: simulate reload — fresh wavoip seeded with stored tokens
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBe("tok-y:false:true");
    const tokens = stored?.split(";").map((entry) => entry.split(":")[0]) ?? [];
    const wavoipB = new FakeWavoip(tokens);
    const storeB = createMiddlewareStore();
    const controllerB = new DeviceController({ wavoip: wavoipB.asWavoip(), store: storeB });
    controllerB.hydrate();

    const [device] = storeB.getState().devices;
    expect(device.token).toBe("tok-y");
    expect(device.persist).toBe(true);
  });
});

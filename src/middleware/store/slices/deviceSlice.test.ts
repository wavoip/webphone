import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";

function makeDevice(token: string, overrides: Partial<DeviceStateEntry> = {}): DeviceStateEntry {
  return {
    token,
    status: "disconnected",
    qrCode: undefined,
    contact: undefined,
    restricted: false,
    enable: false,
    persist: false,
    ...overrides,
  };
}

describe("deviceSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts with empty devices", () => {
    expect(store.getState().devices).toEqual([]);
  });

  it("setDevices replaces the whole list", () => {
    store.getState().setDevices([makeDevice("a"), makeDevice("b")]);
    expect(store.getState().devices.map((d) => d.token)).toEqual(["a", "b"]);
    store.getState().setDevices([makeDevice("c")]);
    expect(store.getState().devices.map((d) => d.token)).toEqual(["c"]);
  });

  it("upsertDevice appends a new device", () => {
    store.getState().upsertDevice(makeDevice("a"));
    store.getState().upsertDevice(makeDevice("b"));
    expect(store.getState().devices.map((d) => d.token)).toEqual(["a", "b"]);
  });

  it("upsertDevice replaces an existing device by token", () => {
    store.getState().upsertDevice(makeDevice("a", { status: "disconnected" }));
    store.getState().upsertDevice(makeDevice("a", { status: "open", enable: true }));
    const [device] = store.getState().devices;
    expect(device.status).toBe("open");
    expect(device.enable).toBe(true);
  });

  it("removeDeviceState drops the matching token", () => {
    store.getState().setDevices([makeDevice("a"), makeDevice("b")]);
    store.getState().removeDeviceState("a");
    expect(store.getState().devices.map((d) => d.token)).toEqual(["b"]);
  });

  it("updateDeviceState patches fields on a single device", () => {
    store.getState().setDevices([makeDevice("a"), makeDevice("b")]);
    store.getState().updateDeviceState("a", { status: "open", qrCode: "QR" });
    const [a, b] = store.getState().devices;
    expect(a.status).toBe("open");
    expect(a.qrCode).toBe("QR");
    expect(b.status).toBe("disconnected");
  });

  it("updateDeviceState on unknown token is a no-op", () => {
    store.getState().setDevices([makeDevice("a")]);
    store.getState().updateDeviceState("z", { status: "open" });
    expect(store.getState().devices[0].status).toBe("disconnected");
  });

  it("setDeviceEnable flips only the enable flag", () => {
    store.getState().setDevices([makeDevice("a")]);
    store.getState().setDeviceEnable("a", true);
    expect(store.getState().devices[0].enable).toBe(true);
    store.getState().setDeviceEnable("a", false);
    expect(store.getState().devices[0].enable).toBe(false);
  });

  it("setDevicePersist flips only the persist flag", () => {
    store.getState().setDevices([makeDevice("a")]);
    store.getState().setDevicePersist("a", true);
    expect(store.getState().devices[0].persist).toBe(true);
  });

  it("updateDeviceState patches restricted flag", () => {
    store.getState().setDevices([makeDevice("a")]);
    store.getState().updateDeviceState("a", { restricted: true });
    expect(store.getState().devices[0].restricted).toBe(true);
    store.getState().updateDeviceState("a", { restricted: false });
    expect(store.getState().devices[0].restricted).toBe(false);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { DeviceController } from "@/middleware/controllers/DeviceController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("DeviceController", () => {
  let store: MiddlewareStoreApi;
  let wavoip: FakeWavoip;
  let controller: DeviceController;

  beforeEach(() => {
    localStorage.clear();
    wavoip = new FakeWavoip();
    store = createMiddlewareStore();
    controller = new DeviceController({ wavoip: wavoip.asWavoip(), store });
  });

  it("hydrate seeds store with wavoip.getDevices()", () => {
    wavoip.addDevices(["tok-1", "tok-2"]);
    controller.hydrate();
    expect(store.getState().devices.map((d) => d.token)).toEqual(["tok-1", "tok-2"]);
  });

  it("hydrate restores persist + enable flags from localStorage", () => {
    localStorage.setItem("wavoip:tokens", "tok-1:true:true;tok-2:false:true");
    wavoip.addDevices(["tok-1", "tok-2"]);
    controller.hydrate();
    const [a, b] = store.getState().devices;
    expect(a.persist).toBe(true);
    expect(a.enable).toBe(true);
    expect(b.persist).toBe(true);
    expect(b.enable).toBe(false);
  });

  it("hydrate restores a real-world UUID-style token from localStorage", () => {
    const uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    localStorage.setItem("wavoip:tokens", `${uuid}:true:true`);
    wavoip.addDevices([uuid]);
    controller.hydrate();
    const [device] = store.getState().devices;
    expect(device.token).toBe(uuid);
    expect(device.persist).toBe(true);
    expect(device.enable).toBe(true);
  });

  it("hydrate from injected wavoip with merged stored tokens", () => {
    // Simulates MiddlewareRoot path where caller passes their own (empty)
    // Wavoip and the runtime calls addDevices(stored) before hydrate.
    const uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    localStorage.setItem("wavoip:tokens", `${uuid}:true:true`);
    wavoip.addDevices([uuid]);
    controller.hydrate();
    expect(store.getState().devices.map((d) => d.token)).toEqual([uuid]);
    expect(store.getState().devices[0].persist).toBe(true);
  });

  it("hydrate falls back to status-based enable when no localStorage entry", () => {
    wavoip.addDevices(["tok-1"]);
    controller.hydrate();
    const [device] = store.getState().devices;
    expect(device.persist).toBe(false);
    expect(device.enable).toBe(false);
  });

  it("add invokes wavoip.addDevices and upserts into store", () => {
    controller.add("tok-1");
    expect(wavoip.getDevices().map((d) => d.token)).toEqual(["tok-1"]);
    expect(store.getState().devices.map((d) => d.token)).toEqual(["tok-1"]);
  });

  it("add persists the persist flag", () => {
    controller.add("tok-1", true);
    expect(store.getState().devices[0].persist).toBe(true);
  });

  it("remove invokes wavoip.removeDevices and drops from store", () => {
    controller.add("tok-1");
    controller.remove("tok-1");
    expect(wavoip.getDevices()).toEqual([]);
    expect(store.getState().devices).toEqual([]);
  });

  it("enable flips the enable flag in store", () => {
    controller.add("tok-1");
    controller.enable("tok-1");
    expect(store.getState().devices[0].enable).toBe(true);
  });

  it("disable clears the enable flag in store", () => {
    controller.add("tok-1");
    controller.enable("tok-1");
    controller.disable("tok-1");
    expect(store.getState().devices[0].enable).toBe(false);
  });

  it("device qrCodeChanged events update store", () => {
    controller.add("tok-1");
    const [fake] = wavoip.getDevices();
    (fake as unknown as { emitEvent: (e: string, v: string) => void }).emitEvent("qrCodeChanged", "QR-CODE");
    expect(store.getState().devices[0].qrCode).toBe("QR-CODE");
  });

  it("device statusChanged auto-enables when status is open", () => {
    controller.add("tok-1");
    const [fake] = wavoip.getDevices();
    (fake as unknown as { emitEvent: (e: string, v: string) => void }).emitEvent("statusChanged", "open");
    const [device] = store.getState().devices;
    expect(device.status).toBe("open");
    expect(device.enable).toBe(true);
  });

  it("device statusChanged to non-open does not auto-enable", () => {
    controller.add("tok-1");
    const [fake] = wavoip.getDevices();
    (fake as unknown as { emitEvent: (e: string, v: string) => void }).emitEvent("statusChanged", "disconnected");
    expect(store.getState().devices[0].enable).toBe(false);
  });

  it("device contactChanged events update store", () => {
    controller.add("tok-1");
    const [fake] = wavoip.getDevices();
    (fake as unknown as { emitEvent: (e: string, v: { phone: string }) => void }).emitEvent("contactChanged", {
      phone: "5511",
    });
    expect(store.getState().devices[0].contact).toEqual({ phone: "5511" });
  });
});

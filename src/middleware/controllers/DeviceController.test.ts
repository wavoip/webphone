import { beforeEach, describe, expect, it } from "vitest";
import { DeviceController } from "@/middleware/controllers/DeviceController";
import { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("DeviceController", () => {
  let store: MiddlewareStoreApi;
  let wavoip: FakeWavoip;
  let notifications: NotificationsController;
  let controller: DeviceController;

  beforeEach(() => {
    localStorage.clear();
    wavoip = new FakeWavoip();
    store = createMiddlewareStore();
    notifications = new NotificationsController({ store });
    controller = new DeviceController({ wavoip: wavoip.asWavoip(), store, notifications });
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

  describe("restriction", () => {
    it("restrictedChanged true patches state and adds DEVICE_RESTRICTED notification", () => {
      controller.add("tok-1");
      const [fake] = wavoip.getDevices();
      (fake as unknown as { emitEvent: (e: string, r: boolean, u: Date | null) => void }).emitEvent(
        "restrictedChanged",
        true,
        null,
      );

      expect(store.getState().devices[0].restricted).toBe(true);
      const notes = store.getState().notifications;
      expect(notes).toHaveLength(1);
      expect(notes[0].type).toBe("DEVICE_RESTRICTED");
      expect(notes[0].token).toBe("tok-1");
      expect(notes[0].message).toBe("tok-1");
    });

    it("restrictedChanged carries restrictedUntil date into the store", () => {
      controller.add("tok-1");
      const [fake] = wavoip.getDevices();
      const until = new Date("2030-01-15T12:34:56.000Z");
      (fake as unknown as { emitEvent: (e: string, r: boolean, u: Date | null) => void }).emitEvent(
        "restrictedChanged",
        true,
        until,
      );

      expect(store.getState().devices[0].restrictedUntil).toEqual(until);
    });

    it("notification message includes contact phone and device token when contact is known", () => {
      controller.add("tok-1");
      const [fake] = wavoip.getDevices() as unknown as Array<{
        contact: { phone: string };
        emitEvent: (e: string, r: boolean, u: Date | null) => void;
      }>;
      fake.contact = { phone: "5511999990000" };
      fake.emitEvent("restrictedChanged", true, null);

      const notes = store.getState().notifications;
      expect(notes[0].message).toBe("5511999990000 · tok-1");
    });

    it("restrictedChanged false patches state and adds DEVICE_RESTRICTION_LIFTED notification", () => {
      controller.add("tok-1");
      const [fake] = wavoip.getDevices() as unknown as Array<{
        restricted: boolean;
        emitEvent: (e: string, r: boolean, u: Date | null) => void;
      }>;
      fake.restricted = true;
      store.getState().updateDeviceState("tok-1", { restricted: true });

      fake.emitEvent("restrictedChanged", false, null);

      expect(store.getState().devices[0].restricted).toBe(false);
      expect(store.getState().devices[0].restrictedUntil).toBe(null);
      const notes = store.getState().notifications;
      expect(notes[0].type).toBe("DEVICE_RESTRICTION_LIFTED");
    });

    it("does not duplicate notification when restrictedChanged fires with same value", () => {
      controller.add("tok-1");
      const [fake] = wavoip.getDevices();
      const emit = (fake as unknown as { emitEvent: (e: string, r: boolean, u: Date | null) => void }).emitEvent;
      emit.call(fake, "restrictedChanged", false, null);
      emit.call(fake, "restrictedChanged", false, null);
      expect(store.getState().notifications).toHaveLength(0);
    });

    it("hydrate fires notification once for devices that start restricted and seeds restrictedUntil", () => {
      wavoip.addDevices(["tok-1"]);
      const until = new Date("2030-01-15T12:34:56.000Z");
      const [fake] = wavoip.getDevices() as unknown as Array<{ restricted: boolean; restrictedUntil: Date | null }>;
      fake.restricted = true;
      fake.restrictedUntil = until;

      controller.hydrate();

      expect(store.getState().devices[0].restricted).toBe(true);
      expect(store.getState().devices[0].restrictedUntil).toEqual(until);
      const notes = store.getState().notifications;
      expect(notes).toHaveLength(1);
      expect(notes[0].type).toBe("DEVICE_RESTRICTED");
    });
  });
});

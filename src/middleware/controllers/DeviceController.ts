import type { Device, Wavoip } from "@wavoip/wavoip-api";
import { getSettings } from "@/lib/device-settings";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { wavoip: Wavoip; store: MiddlewareStoreApi };

export class DeviceController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  hydrate(): void {
    const stored = getSettings();
    const devices = this.deps.wavoip.getDevices();
    const seeded = devices.map((d) => {
      const saved = stored.get(d.token);
      return this.toState(d, {
        enable: saved?.enable ?? d.status === "open",
        persist: saved?.persist ?? false,
      });
    });
    this.deps.store.getState().setDevices(seeded);
    for (const device of devices) this.bindEvents(device);
  }

  add(token: string, persist = false): void {
    const [device] = this.deps.wavoip.addDevices([token]);
    if (!device) return;
    this.deps.store.getState().upsertDevice(this.toState(device, { enable: device.status === "open", persist }));
    this.bindEvents(device);
  }

  remove(token: string): void {
    this.deps.wavoip.removeDevices([token]);
    this.deps.store.getState().removeDeviceState(token);
  }

  enable(token: string): void {
    this.deps.store.getState().setDeviceEnable(token, true);
  }

  disable(token: string): void {
    this.deps.store.getState().setDeviceEnable(token, false);
  }

  async wakeUp(token: string): Promise<boolean> {
    const device = this.deps.wavoip.getDevices().find((d) => d.token === token);
    if (!device) return false;
    return device.wakeUp();
  }

  private bindEvents(device: Device): void {
    const { store } = this.deps;
    device.on("qrCodeChanged", (qrCode) => store.getState().updateDeviceState(device.token, { qrCode }));
    device.on("contactChanged", (contact) => store.getState().updateDeviceState(device.token, { contact }));
    device.on("statusChanged", (status) => {
      const patch =
        status === "open" ? { status, enable: true } : { status };
      store.getState().updateDeviceState(device.token, patch);
    });
  }

  private toState(device: Device, extras: { enable: boolean; persist: boolean }) {
    return {
      token: device.token,
      status: device.status,
      qrCode: device.qrCode,
      contact: device.contact,
      enable: extras.enable,
      persist: extras.persist,
    };
  }
}

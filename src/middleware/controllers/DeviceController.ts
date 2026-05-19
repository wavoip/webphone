import type { Device, Wavoip } from "@wavoip/wavoip-api";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { wavoip: Wavoip; store: MiddlewareStoreApi };

export class DeviceController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  hydrate(): void {
    const devices = this.deps.wavoip.getDevices();
    const seeded = devices.map((d) => this.toState(d, { enable: d.status === "open", persist: false }));
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

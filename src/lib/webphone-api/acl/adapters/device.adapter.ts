import { getSettings, saveSettings } from "@/lib/device-settings";
import { bus } from "@/lib/webphone-api/bus";
import type { Device, DeviceState, Wavoip } from "@/lib/webphone-api/sdk-types";

export function bootDeviceAdapter(wavoip: Wavoip): () => void {
  const stored = getSettings();

  let devices: DeviceState[] = wavoip.getDevices().map((device) => {
    const settings = stored.get(device.token);
    return {
      ...device,
      enable: !!settings?.enable,
      persist: !!settings?.persist,
    };
  });

  const persist = () => saveSettings(devices);

  const emit = () => bus.emit("device.list.changed", devices);

  function bindDeviceEvents(device: Device): void {
    device.on("qrCodeChanged", (qrcode) => {
      devices = devices.map((d) => (d.token === device.token ? { ...d, qrcode } : d));
      bus.emit("device.qr.changed", { token: device.token, qrcode });
      emit();
    });

    device.on("statusChanged", (status) => {
      devices = devices.map((d) => (d.token === device.token ? { ...d, status, enable: status === "open" } : d));
      bus.emit("device.status.changed", { token: device.token, status });
      emit();
    });

    device.on("contactChanged", (contact) => {
      devices = devices.map((d) => (d.token === device.token ? { ...d, contact } : d));
      bus.emit("device.contact.changed", { token: device.token, contact });
      emit();
    });
  }

  function add(token: string, persistFlag?: boolean): void {
    const [device] = wavoip.addDevices([token]);
    if (!device) return;
    bindDeviceEvents(device);
    devices = [...devices, { ...device, enable: device.status === "open", persist: persistFlag ?? false }];
    persist();
    emit();
  }

  function remove(token: string): void {
    wavoip.removeDevices([token]);
    devices = devices.filter((d) => d.token !== token);
    persist();
    emit();
  }

  function enable(token: string): void {
    devices = devices.map((d) => (d.token === token ? { ...d, enable: true } : d));
    persist();
    emit();
  }

  function disable(token: string): void {
    devices = devices.map((d) => (d.token === token ? { ...d, enable: false } : d));
    persist();
    emit();
  }

  for (const device of wavoip.getDevices()) bindDeviceEvents(device);
  persist();

  const unsubs: Array<() => void> = [
    bus.registerQuery("device.list", () => devices),
    bus.handle("device.add", async ({ token, persist: p }) => add(token, p)),
    bus.handle("device.remove", async ({ token }) => remove(token)),
    bus.handle("device.enable", async ({ token }) => enable(token)),
    bus.handle("device.disable", async ({ token }) => disable(token)),
  ];

  emit();

  return () => {
    for (const u of unsubs.reverse()) u();
  };
}

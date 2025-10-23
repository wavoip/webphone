import type { Device } from "@wavoip/wavoip-api";

const key = "wavoip:tokens";

export type DeviceSettings = {
  token: string;
  enable: boolean;
};

export function getSettings() {
  const storageItem = localStorage.getItem(key);
  const storageDevices = storageItem?.split(";") || [];

  const deviceSettings = storageDevices.map((device) => {
    const [token, enable] = device.split(":");

    return { token, enable: enable === "true" };
  });

  return new Map<string, DeviceSettings>(deviceSettings.map((settings) => [settings.token, settings]));
}

export function saveSettings(devices: (Device & { enable: boolean })[]) {
  const storageItem = devices.map((device) => `${device.token}:${device.enable}`).join(";");

  localStorage.setItem(key, storageItem);
}

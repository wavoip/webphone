import type { Device } from "@wavoip/wavoip-api";

const key = "wavoip:tokens";

export type DeviceSettings = {
  token: string;
  enable: boolean;
  persist: boolean;
};

export function getSettings() {
  const storageItem = localStorage.getItem(key);
  const storageDevices = storageItem?.length ? storageItem.split(";") : [];

  const deviceSettings = storageDevices.map((device) => {
    const [token, enable, persist] = device.split(":");

    return { token, enable: enable === "true", persist: persist === "true" };
  });

  return new Map<string, DeviceSettings>(deviceSettings.map((settings) => [settings.token, settings]));
}

export function saveSettings(devices: (Device & DeviceSettings)[]) {
  const storageItem = devices
    .filter((device) => device.persist)
    .map((device) => `${device.token}:${device.enable}:${device.persist}`)
    .join(";");

  localStorage.setItem(key, storageItem);
}

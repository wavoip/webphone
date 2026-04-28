import type { Device } from "@wavoip/wavoip-api";

const key = "wavoip:tokens";

export type DeviceSettings = {
  token: string;
  enable: boolean;
};

export function getSettings() {
  const storageItem = localStorage.getItem(key);
  const storageDevices = storageItem?.split(";").filter(Boolean) || [];

  const deviceSettings = storageDevices
    .map((device) => {
      const [token, enable] = device.split(":");
      return { token, enable: enable === "true" };
    })
    .filter((s) => !!s.token);

  return new Map<string, DeviceSettings>(deviceSettings.map((settings) => [settings.token, settings]));
}

export function getSpeakerVolume(): number {
  const stored = localStorage.getItem("wavoip:speaker-volume");
  if (stored === null) return 0.8;
  const val = Number(stored);
  return isNaN(val) ? 0.8 : Math.max(0, Math.min(1, val / 100));
}

export function saveSettings(devices: (Device & { enable: boolean })[]) {
  const storageItem = devices
    .filter((device) => !!device.token)
    .map((device) => `${device.token}:${device.enable}`)
    .join(";");

  localStorage.setItem(key, storageItem);
}

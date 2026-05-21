import type { Contact, DeviceStatus } from "@wavoip/wavoip-api";
import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

export type DeviceStateEntry = {
  token: string;
  status: DeviceStatus;
  qrCode?: string;
  contact?: Contact;
  enable: boolean;
  persist: boolean;
};

export type DeviceSliceState = {
  devices: DeviceStateEntry[];
};

export type DeviceSliceActions = {
  setDevices: (devices: DeviceStateEntry[]) => void;
  upsertDevice: (device: DeviceStateEntry) => void;
  removeDeviceState: (token: string) => void;
  updateDeviceState: (token: string, patch: Partial<DeviceStateEntry>) => void;
  setDeviceEnable: (token: string, enable: boolean) => void;
  setDevicePersist: (token: string, persist: boolean) => void;
};

export type DeviceSlice = DeviceSliceState & DeviceSliceActions;

function patchDevice(devices: DeviceStateEntry[], token: string, patch: Partial<DeviceStateEntry>): DeviceStateEntry[] {
  return devices.map((d) => (d.token === token ? { ...d, ...patch } : d));
}

export const createDeviceSlice: StateCreator<MiddlewareStore, [], [], DeviceSlice> = (set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  upsertDevice: (device) =>
    set((state) => {
      const exists = state.devices.some((d) => d.token === device.token);
      if (exists) return { devices: patchDevice(state.devices, device.token, device) };
      return { devices: [...state.devices, device] };
    }),
  removeDeviceState: (token) => set((state) => ({ devices: state.devices.filter((d) => d.token !== token) })),
  updateDeviceState: (token, patch) => set((state) => ({ devices: patchDevice(state.devices, token, patch) })),
  setDeviceEnable: (token, enable) => set((state) => ({ devices: patchDevice(state.devices, token, { enable }) })),
  setDevicePersist: (token, persist) => set((state) => ({ devices: patchDevice(state.devices, token, { persist }) })),
});

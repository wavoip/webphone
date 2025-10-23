import type { Device, Wavoip } from "@wavoip/wavoip-api";

export type WebphoneAPI = {
  getDevices: Wavoip["getDevices"];
  addDevice: (token: string) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
  startCall: (to: string) => void;
  widget: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
};

export const webphoneAPI: WebphoneAPI = {
  getDevices: (): Device[] => [],
  addDevice: (_token: string): void => {},
  removeDevice: (_token: string): void => {},
  enableDevice: (_token: string): void => {},
  disableDevice: (_token: string): void => {},
  startCall: (_to: string): void => {},
  widget: {
    open: (): void => {},
    close: (): void => {},
    toggle: (): void => {},
  },
};

window.wavoip = webphoneAPI;

export function buildAPI(api: WebphoneAPI) {
  webphoneAPI.addDevice = api.addDevice;
  webphoneAPI.removeDevice = api.removeDevice;
  webphoneAPI.getDevices = api.getDevices;
  webphoneAPI.enableDevice = api.enableDevice;
  webphoneAPI.disableDevice = api.disableDevice;
  webphoneAPI.startCall = api.startCall;
  webphoneAPI.widget = {
    open: api.widget.open,
    close: api.widget.close,
    toggle: api.widget.toggle,
  };
}

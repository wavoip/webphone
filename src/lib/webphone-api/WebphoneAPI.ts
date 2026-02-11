import type { CallActive, CallOffer, CallOutgoing } from "@wavoip/wavoip-api";
import type { DeviceState } from "@/hooks/useDeviceManager";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme, WebphonePosition, WidgetButtonPosition } from "@/providers/settings/settings";

export type CallActiveProps = Pick<
  CallActive,
  "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted"
>;
export type CallOutgoingProps = Pick<
  CallOutgoing,
  "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted"
>;
export type CallOfferProps = Pick<
  CallOffer,
  "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted"
>;

export type CallAPI = {
  start: (
    to: string,
    config?: {
      fromTokens?: string[];
      displayName?: string;
    },
  ) => Promise<{ err: { message: string; devices: { token: string; reason: string }[] } } | { err: null }>;
  startCall: (
    to: string,
    fromTokens: string[] | null,
  ) => Promise<{ err: { message: string; devices: { token: string; reason: string }[] } } | { err: null }>;
  getCallActive: () => CallActiveProps | undefined;
  getCallOutgoing: () => CallOutgoingProps | undefined;
  getOffers: () => CallOfferProps[];
  setInput: (number: string) => void;
  onOffer(cb: (offer: CallOfferProps) => void): void;
};

export type DeviceAPI = {
  getDevices: () => DeviceState[];
  get: () => DeviceState[];
  addDevice: (token: string, persist: boolean) => void;
  add: (token: string, persist: boolean) => void;
  removeDevice: (token: string) => void;
  remove: (token: string) => void;
  enableDevice: (token: string) => void;
  enable: (token: string) => void;
  disableDevice: (token: string) => void;
  disable: (token: string) => void;
};

export type NotificationsAPI = {
  getNotifications: () => NotificationsType[];
  get: () => NotificationsType[];
  addNotification: (notification: NotificationsType) => void;
  add: (notification: NotificationsType) => void;
  removeNotification: (id: Date) => void;
  remove: (id: Date) => void;
  clearNotifications: () => void;
  clear: () => void;
  readNotifications: () => void;
  read: () => void;
};

export type WidgetAPI = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  buttonPosition: {
    value: { x: number; y: number };
    set: (position: WidgetButtonPosition) => void;
  };
};

export type ThemeAPI = {
  value: Theme;
  set: (theme: Theme) => void;
  setTheme: (theme: Theme) => void;
};

export type SettingsAPI = {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showDevices: boolean;
  setShowDevices: (show: boolean) => void;
  showAddDevices: boolean;
  setShowAddDevices: (show: boolean) => void;
  showEnableDevices: boolean;
  setShowEnableDevices: (show: boolean) => void;
  showRemoveDevices: boolean;
  setShowRemoveDevices: (show: boolean) => void;
  showWidgetButton: boolean;
  setShowWidgetButton: (show: boolean) => void;
};

export type PositionAPI = {
  value: { x: number; y: number };
  set: (position: WebphonePosition) => void;
};

export type WebphoneAPI = {
  call: CallAPI;
  device: DeviceAPI;
  notifications: NotificationsAPI;
  widget: WidgetAPI;
  theme: ThemeAPI;
  position: PositionAPI;
  settings: SettingsAPI;
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends Record<string, unknown>
        ? T[P] extends { x: number; y: number }
          ? T[P]
          : DeepPartial<T[P]>
        : T[P];
    }
  : T;

export type WebphoneAPIPartial = DeepPartial<WebphoneAPI>;

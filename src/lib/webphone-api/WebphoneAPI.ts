import type { CallActive, CallOutgoing, CallPeer, Offer } from "@wavoip/wavoip-api";
import type { WebphoneEventMap, WebphoneEventName } from "@/middleware/events/eventTypes";
import type { DeviceStateEntry as DeviceState } from "@/middleware/store/slices/deviceSlice";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme, WebphonePosition, WidgetButtonPosition } from "@/providers/settings/settings";

export type CallActiveProps = Pick<CallActive, "id" | "type" | "device_token" | "direction" | "status" | "peer">;
export type CallOutgoingProps = Pick<CallOutgoing, "id" | "type" | "device_token" | "direction" | "status" | "peer">;
export type CallOfferProps = Pick<Offer, "id" | "type" | "device_token" | "direction" | "status" | "peer">;

export type CallAPI = {
  start: (
    to: string,
    config?: {
      fromTokens?: string[];
      displayName?: string;
    },
  ) => Promise<
    | { call: null; err: { message: string; devices: { token: string; reason: string }[] } }
    | { call: { id: string; peer: CallPeer }; err: null }
  >;
  /**
   * @deprecated Use {@link CallAPI.start} instead. `startCall` will be removed in a future major release.
   *
   * @example
   * // Before
   * window.wavoip.call.startCall("5511999999999", ["token-a"]);
   * // After
   * window.wavoip.call.start("5511999999999", { fromTokens: ["token-a"] });
   */
  startCall: (
    to: string,
    fromTokens: string[] | null,
  ) => Promise<
    | { call: null; err: { message: string; devices: { token: string; reason: string }[] } }
    | { call: { id: string; peer: CallPeer }; err: null }
  >;
  getCallActive: () => CallActiveProps | undefined;
  getCallOutgoing: () => CallOutgoingProps | undefined;
  getOffers: () => CallOfferProps[];
  setInput: (number: string) => void;
  onOffer(cb: (offer: CallOfferProps) => void): void;
};

export type DeviceAPI = {
  get: () => DeviceState[];
  add: (token: string, persist: boolean) => void;
  remove: (token: string) => void;
  enable: (token: string) => void;
  disable: (token: string) => void;
  /** @deprecated Use {@link DeviceAPI.get} instead. */
  getDevices: () => DeviceState[];
  /** @deprecated Use {@link DeviceAPI.add} instead. */
  addDevice: (token: string, persist: boolean) => void;
  /** @deprecated Use {@link DeviceAPI.remove} instead. */
  removeDevice: (token: string) => void;
  /** @deprecated Use {@link DeviceAPI.enable} instead. */
  enableDevice: (token: string) => void;
  /** @deprecated Use {@link DeviceAPI.disable} instead. */
  disableDevice: (token: string) => void;
};

export type NotificationsAPI = {
  get: () => NotificationsType[];
  add: (notification: NotificationsType) => void;
  remove: (id: Date) => void;
  clear: () => void;
  read: () => void;
  /** @deprecated Use {@link NotificationsAPI.get} instead. */
  getNotifications: () => NotificationsType[];
  /** @deprecated Use {@link NotificationsAPI.add} instead. */
  addNotification: (notification: NotificationsType) => void;
  /** @deprecated Use {@link NotificationsAPI.remove} instead. */
  removeNotification: (id: Date) => void;
  /** @deprecated Use {@link NotificationsAPI.clear} instead. */
  clearNotifications: () => void;
  /** @deprecated Use {@link NotificationsAPI.read} instead. */
  readNotifications: () => void;
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
  /** @deprecated Use {@link ThemeAPI.set} instead. */
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
  on: <K extends WebphoneEventName>(event: K, cb: (payload: WebphoneEventMap[K]) => void) => () => void;
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

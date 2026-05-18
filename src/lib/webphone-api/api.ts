import { bus } from "@/lib/webphone-api/bus";
import type { CallOfferProps, WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";

let externalOnOffer: ((o: CallOfferProps) => void) | null = null;
bus.on("offer.received", (props) => externalOnOffer?.(props));

const call: WebphoneAPI["call"] = {
  start: (to, config) =>
    bus.request("call.start", {
      to,
      fromTokens: config?.fromTokens,
      displayName: config?.displayName,
    }),
  startCall: (to, fromTokens) =>
    bus.request("call.start", {
      to,
      fromTokens: fromTokens ?? undefined,
    }),
  getCallActive: () => {
    const c = bus.query("call.active");
    if (!c) return undefined;
    const { id, type, status, device_token, direction, peer } = c;
    return { id, type, status, device_token, direction, peer };
  },
  getCallOutgoing: () => {
    const c = bus.query("call.outgoing");
    if (!c) return undefined;
    const { id, type, status, device_token, direction, peer } = c;
    return { id, type, status, device_token, direction, peer };
  },
  getOffers: () =>
    bus.query("call.offers").map(({ id, type, status, device_token, direction, peer }) => ({
      id,
      type,
      status,
      device_token,
      direction,
      peer,
    })),
  setInput: (value) => bus.emit("call.input.changed", value),
  onOffer: (cb) => {
    externalOnOffer = cb;
  },
};

const device: WebphoneAPI["device"] = {
  getDevices: () => bus.query("device.list"),
  get: () => bus.query("device.list"),
  addDevice: (token, persist) => {
    void bus.request("device.add", { token, persist });
  },
  add: (token, persist) => {
    void bus.request("device.add", { token, persist });
  },
  removeDevice: (token) => {
    void bus.request("device.remove", { token });
  },
  remove: (token) => {
    void bus.request("device.remove", { token });
  },
  enableDevice: (token) => {
    void bus.request("device.enable", { token });
  },
  enable: (token) => {
    void bus.request("device.enable", { token });
  },
  disableDevice: (token) => {
    void bus.request("device.disable", { token });
  },
  disable: (token) => {
    void bus.request("device.disable", { token });
  },
};

const notifications: WebphoneAPI["notifications"] = {
  getNotifications: () => bus.query("notifications.list"),
  get: () => bus.query("notifications.list"),
  addNotification: (n) => {
    void bus.request("notifications.add", { notification: n });
  },
  add: (n) => {
    void bus.request("notifications.add", { notification: n });
  },
  removeNotification: (id) => {
    void bus.request("notifications.remove", { id });
  },
  remove: (id) => {
    void bus.request("notifications.remove", { id });
  },
  clearNotifications: () => {
    void bus.request("notifications.clear", undefined);
  },
  clear: () => {
    void bus.request("notifications.clear", undefined);
  },
  readNotifications: () => {
    void bus.request("notifications.read", undefined);
  },
  read: () => {
    void bus.request("notifications.read", undefined);
  },
};

const widget: WebphoneAPI["widget"] = {
  get isOpen() {
    return bus.query("widget.isOpen");
  },
  open: () => {
    void bus.request("widget.open", undefined);
  },
  close: () => {
    void bus.request("widget.close", undefined);
  },
  toggle: () => {
    void bus.request("widget.toggle", undefined);
  },
  buttonPosition: {
    get value() {
      return bus.query("widget.buttonPosition");
    },
    set: (raw) => {
      void bus.request("widget.buttonPosition.set", { value: raw });
    },
  },
};

const theme: WebphoneAPI["theme"] = {
  get value() {
    return bus.query("theme.value");
  },
  set: (t) => {
    void bus.request("theme.set", { theme: t });
  },
  setTheme: (t) => {
    void bus.request("theme.set", { theme: t });
  },
};

const settings: WebphoneAPI["settings"] = {
  get showNotifications() {
    return bus.query("settings.showNotifications");
  },
  setShowNotifications: (v) => {
    void bus.request("settings.setShowNotifications", { value: v });
  },
  get showSettings() {
    return bus.query("settings.showSettings");
  },
  setShowSettings: (v) => {
    void bus.request("settings.setShowSettings", { value: v });
  },
  get showDevices() {
    return bus.query("settings.showDevices");
  },
  setShowDevices: (v) => {
    void bus.request("settings.setShowDevices", { value: v });
  },
  get showAddDevices() {
    return bus.query("settings.showAddDevices");
  },
  setShowAddDevices: (v) => {
    void bus.request("settings.setShowAddDevices", { value: v });
  },
  get showEnableDevices() {
    return bus.query("settings.showEnableDevices");
  },
  setShowEnableDevices: (v) => {
    void bus.request("settings.setShowEnableDevices", { value: v });
  },
  get showRemoveDevices() {
    return bus.query("settings.showRemoveDevices");
  },
  setShowRemoveDevices: (v) => {
    void bus.request("settings.setShowRemoveDevices", { value: v });
  },
  get showWidgetButton() {
    return bus.query("settings.showWidgetButton");
  },
  setShowWidgetButton: (v) => {
    void bus.request("settings.setShowWidgetButton", { value: v });
  },
};

const position: WebphoneAPI["position"] = {
  get value() {
    return bus.query("position.value");
  },
  set: (raw) => {
    void bus.request("position.setRaw", { value: raw });
  },
};

const APIProxy: WebphoneAPI = {
  call,
  device,
  notifications,
  widget,
  theme,
  settings,
  position,
};

const { promise: webphoneAPIPromise, resolve } = Promise.withResolvers<WebphoneAPI>();
let resolved = false;
bus.on("acl.ready", () => {
  if (resolved) return;
  resolved = true;
  resolve(APIProxy);
});

export { webphoneAPIPromise };

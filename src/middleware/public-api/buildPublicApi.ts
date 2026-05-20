import type { CallActive, CallOutgoing, Offer } from "@wavoip/wavoip-api";
import { warnDeprecated } from "@/lib/webphone-api/api";
import type {
  CallActiveProps,
  CallOfferProps,
  CallOutgoingProps,
  WebphoneAPI,
} from "@/lib/webphone-api/WebphoneAPI";
import type { Middleware } from "@/middleware/Middleware";

/**
 * Builds the public `window.wavoip` API from a {@link Middleware} instance.
 * Reads are getters so consumers always see fresh store state; writes route
 * through controllers or store actions.
 */
export function buildPublicApi(middleware: Middleware): WebphoneAPI {
  const { store, controllers, registry } = middleware;

  return {
    call: {
      start: (to, config) => controllers.call.start(to, config),
      startCall: (to, fromTokens) => {
        warnDeprecated("call.startCall", "call.start(to, { fromTokens })");
        return controllers.call.start(to, fromTokens ? { fromTokens } : {});
      },
      getCallActive: () => projectActive(store.getState().active),
      getCallOutgoing: () => projectOutgoing(store.getState().outgoing),
      getOffers: () => store.getState().offers.map(projectOffer),
      setInput: () => {
        // Placeholder: keyboard input setter is owned by the React layer
        // and is overlaid via `mergeToAPI`. See KeyboardScreen.
      },
      onOffer: (cb) => {
        registry.use("offer", (offer, next) => {
          cb(projectOffer(offer));
          next();
        });
      },
    },
    device: {
      get: () => store.getState().devices,
      add: (token, persist) => controllers.device.add(token, persist),
      remove: (token) => controllers.device.remove(token),
      enable: (token) => controllers.device.enable(token),
      disable: (token) => controllers.device.disable(token),
      getDevices: () => {
        warnDeprecated("device.getDevices", "device.get");
        return store.getState().devices;
      },
      addDevice: (token, persist) => {
        warnDeprecated("device.addDevice", "device.add");
        controllers.device.add(token, persist);
      },
      removeDevice: (token) => {
        warnDeprecated("device.removeDevice", "device.remove");
        controllers.device.remove(token);
      },
      enableDevice: (token) => {
        warnDeprecated("device.enableDevice", "device.enable");
        controllers.device.enable(token);
      },
      disableDevice: (token) => {
        warnDeprecated("device.disableDevice", "device.disable");
        controllers.device.disable(token);
      },
    },
    notifications: {
      get: () => store.getState().notifications,
      add: (n) => controllers.notifications.add(n),
      remove: (id) => controllers.notifications.remove(id),
      clear: () => controllers.notifications.clear(),
      read: () => controllers.notifications.markAllRead(),
      getNotifications: () => {
        warnDeprecated("notifications.getNotifications", "notifications.get");
        return store.getState().notifications;
      },
      addNotification: (n) => {
        warnDeprecated("notifications.addNotification", "notifications.add");
        controllers.notifications.add(n);
      },
      removeNotification: (id) => {
        warnDeprecated("notifications.removeNotification", "notifications.remove");
        controllers.notifications.remove(id);
      },
      clearNotifications: () => {
        warnDeprecated("notifications.clearNotifications", "notifications.clear");
        controllers.notifications.clear();
      },
      readNotifications: () => {
        warnDeprecated("notifications.readNotifications", "notifications.read");
        controllers.notifications.markAllRead();
      },
    },
    widget: {
      get isOpen() {
        return !store.getState().isClosed;
      },
      open: () => store.getState().openWidget(),
      close: () => store.getState().closeWidget(),
      toggle: () => store.getState().toggleWidget(),
      buttonPosition: {
        get value() {
          return store.getState().buttonPosition;
        },
        set: (position) => {
          if (typeof position === "object") store.getState().setButtonPosition(position);
        },
      },
    },
    theme: {
      get value() {
        return store.getState().theme;
      },
      set: (theme) => store.getState().setTheme(theme),
      setTheme: (theme) => {
        warnDeprecated("theme.setTheme", "theme.set");
        store.getState().setTheme(theme);
      },
    },
    settings: {
      get showNotifications() {
        return store.getState().settings.showNotifications;
      },
      get showSettings() {
        return store.getState().settings.showSettings;
      },
      get showDevices() {
        return store.getState().settings.showDevices;
      },
      get showAddDevices() {
        return store.getState().settings.showAddDevices;
      },
      get showEnableDevices() {
        return store.getState().settings.showEnableDevices;
      },
      get showRemoveDevices() {
        return store.getState().settings.showRemoveDevices;
      },
      get showWidgetButton() {
        return store.getState().settings.showWidgetButton;
      },
      setShowNotifications: (v) => store.getState().setSetting("showNotifications", v),
      setShowSettings: (v) => store.getState().setSetting("showSettings", v),
      setShowDevices: (v) => store.getState().setSetting("showDevices", v),
      setShowAddDevices: (v) => store.getState().setSetting("showAddDevices", v),
      setShowEnableDevices: (v) => store.getState().setSetting("showEnableDevices", v),
      setShowRemoveDevices: (v) => store.getState().setSetting("showRemoveDevices", v),
      setShowWidgetButton: (v) => store.getState().setSetting("showWidgetButton", v),
    },
    position: {
      get value() {
        return store.getState().position;
      },
      set: (position) => {
        if (typeof position === "object") store.getState().setWidgetPosition(position);
      },
    },
  };
}

function projectActive(call: CallActive | undefined): CallActiveProps | undefined {
  if (!call) return undefined;
  const { id, type, status, device_token, direction, peer } = call;
  return { id, type, status, device_token, direction, peer };
}

function projectOutgoing(call: CallOutgoing | undefined): CallOutgoingProps | undefined {
  if (!call) return undefined;
  const { id, type, status, device_token, direction, peer } = call;
  return { id, type, status, device_token, direction, peer };
}

function projectOffer(offer: Offer): CallOfferProps {
  const { id, type, status, device_token, direction, peer } = offer;
  return { id, type, status, device_token, direction, peer };
}

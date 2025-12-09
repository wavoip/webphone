import type { CallActive, CallOffer, CallOutgoing, Wavoip } from "@wavoip/wavoip-api";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme } from "@/providers/ThemeProvider";

type CallActiveProps = Pick<CallActive, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;
type CallOutgoingProps = Pick<CallOutgoing, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;
type CallOfferProps = Pick<CallOffer, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;

export type WebphoneAPI = {
  call?: {
    startCall?: (
      to: string,
      fromTokens: string[] | null,
    ) => Promise<
      | {
          err: {
            message: string;
            devices: {
              token: string;
              reason: string;
            }[];
          };
        }
      | {
          err: null;
        }
    >;
    getCallActive?: () => CallActiveProps | undefined;
    getCallOutgoing?: () => CallOutgoingProps | undefined;
    getOffers?: () => CallOfferProps[];
    setInput?: () => void;
  };
  device?: {
    getDevices: Wavoip["getDevices"];
    addDevice: (token: string) => void;
    removeDevice: (token: string) => void;
    enableDevice: (token: string) => void;
    disableDevice: (token: string) => void;
  };
  notifications?: {
    getNotifications: () => NotificationsType[];
    addNotification: (notification: NotificationsType) => void;
    removeNotification: (id: Date) => void;
    clearNotifications: () => void;
    readNotifications: () => void;
  };
  widget?: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  theme?: {
    setTheme: (theme: Theme) => void;
  };
  settings?: {
    showNotifications: boolean;
    showSettings: boolean;
    // showAudio: boolean;
    showDevices: boolean;
    showAddDevices: boolean;
    showEnableDevices: boolean;
    showRemoveDevices: boolean;
    showKeyboardScreen: boolean;
    showWidgetButton: boolean;
    setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    // setShowAudio: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAddDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowEnableDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowRemoveDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowKeyboardScreen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWidgetButton: React.Dispatch<React.SetStateAction<boolean>>;
  };
};

export const webphoneAPI: WebphoneAPI = {};

window.wavoip = webphoneAPI;

export function buildAPI(api: WebphoneAPI) {
  if (api.call) {
    webphoneAPI.call = api.call;
  }
  if (api.notifications) {
    webphoneAPI.notifications = api.notifications;
  }
  if (api.widget) {
    webphoneAPI.widget = api.widget;
  }
  if (api.theme) {
    webphoneAPI.theme = api.theme;
  }
  if (api.settings) {
    webphoneAPI.settings = api.settings;
  }
  if (api.device) {
    webphoneAPI.device = api.device;
  }
}

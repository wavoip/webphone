import type { CallActive, CallOffer, CallOutgoing } from "@wavoip/wavoip-api";
import type { DeviceState } from "@/hooks/useDeviceManager";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme } from "@/providers/ThemeProvider";

type CallActiveProps = Pick<CallActive, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;
type CallOutgoingProps = Pick<CallOutgoing, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;
type CallOfferProps = Pick<CallOffer, "id" | "type" | "device_token" | "direction" | "status" | "peer" | "muted">;

export type WebphoneAPI = {
  call: {
    startCall?: (
      to: string,
      fromTokens: string[] | null,
    ) => Promise<{ err: { message: string; devices: { token: string; reason: string }[] } } | { err: null }>;
    getCallActive?: () => CallActiveProps | undefined;
    getCallOutgoing?: () => CallOutgoingProps | undefined;
    getOffers?: () => CallOfferProps[];
    setInput?: () => void;
  };
  device: {
    getDevices: () => DeviceState[];
    addDevice: (token: string, persist: boolean) => void;
    removeDevice: (token: string) => void;
    enableDevice: (token: string) => void;
    disableDevice: (token: string) => void;
  };
  notifications: {
    getNotifications: () => NotificationsType[];
    addNotification: (notification: NotificationsType) => void;
    removeNotification: (id: Date) => void;
    clearNotifications: () => void;
    readNotifications: () => void;
  };
  widget: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  theme: {
    setTheme: (theme: Theme) => void;
  };
  settings: {
    showNotifications: boolean;
    showSettings: boolean;
    showDevices: boolean;
    showAddDevices: boolean;
    showEnableDevices: boolean;
    showRemoveDevices: boolean;
    showWidgetButton: boolean;
    setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAddDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowEnableDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowRemoveDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWidgetButton: React.Dispatch<React.SetStateAction<boolean>>;
  };
};

let resolveApi: ((api: PromiseLike<WebphoneAPI> | WebphoneAPI) => void) | null = null;

export const webphoneAPIPromise = new Promise<WebphoneAPI>((resolve) => {
  resolveApi = resolve;
});

export const apiAggregator: Partial<WebphoneAPI> = {};

export function buildAPI(api: Partial<WebphoneAPI>) {
  if (api.call) {
    apiAggregator.call = api.call;
  }
  if (api.notifications) {
    apiAggregator.notifications = api.notifications;
  }
  if (api.widget) {
    apiAggregator.widget = api.widget;
  }
  if (api.theme) {
    apiAggregator.theme = api.theme;
  }
  if (api.settings) {
    apiAggregator.settings = api.settings;
  }
  if (api.device) {
    apiAggregator.device = api.device;
  }

  validateAPI(apiAggregator);
}

function validateAPI(api: Partial<WebphoneAPI>) {
  if (api.call && api.notifications && api.widget && api.theme && api.settings && api.device) {
    resolveApi?.(api as WebphoneAPI);
  }
}

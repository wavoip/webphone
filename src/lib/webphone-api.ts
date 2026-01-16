import type { CallActive, CallOffer, CallOutgoing } from "@wavoip/wavoip-api";
import type { DeviceState } from "@/hooks/useDeviceManager";
import type { NotificationsType } from "@/providers/NotificationsProvider";
import type { Theme, WebphonePosition } from "@/providers/settings/settings";

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
  notifications: {
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
  widget: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  theme: {
    value: Theme;
    set: (theme: Theme) => void;
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
    setShowNotifications: (show: boolean) => void;
    setShowSettings: (show: boolean) => void;
    setShowDevices: (show: boolean) => void;
    setShowAddDevices: (show: boolean) => void;
    setShowEnableDevices: (show: boolean) => void;
    setShowRemoveDevices: (show: boolean) => void;
    setShowWidgetButton: (show: boolean) => void;
  };
  position: {
    value: { x: number; y: number };
    set: (position: WebphonePosition) => void;
  };
};

let resolveApi: ((api: PromiseLike<WebphoneAPI> | WebphoneAPI) => void) | null = null;

export const webphoneAPIPromise = new Promise<WebphoneAPI>((resolve) => {
  resolveApi = resolve;
});

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
    }
  : T;

export let apiAggregator: DeepPartial<WebphoneAPI> = {};

export function mergeToAPI(api: DeepPartial<WebphoneAPI>) {
  console.log({ api });
  apiAggregator = mergeObjects(apiAggregator, api);
  console.log({ apiAggregator });
  validateAPI(apiAggregator);
}

function mergeObjects<T extends Record<string, unknown>, E extends DeepPartial<T>>(obj1: T, obj2: E): T {
  const obj1Clean = removeNullishValuesFromObject(obj1);
  const obj2Clean = removeNullishValuesFromObject(obj2);

  for (const key in obj2Clean) {
    if (typeof obj2Clean[key] === "object") {
      obj2Clean[key] = mergeObjects(obj1Clean[key] || Object(), obj2Clean[key]);
    }
  }

  return Object.assign(obj1Clean, obj2Clean);
}

function removeNullishValuesFromObject<T extends Record<string, unknown>>(obj: T): T {
  const cleanObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) continue;

    if (typeof obj[key] === "object") {
      cleanObj[key] = removeNullishValuesFromObject(obj[key] as Record<string, unknown>);
      continue;
    }

    cleanObj[key] = obj[key];
  }

  return cleanObj as T;
}

function validateAPI(api: DeepPartial<WebphoneAPI>) {
  if (api.call && api.notifications && api.widget && api.theme && api.settings && api.device) {
    resolveApi?.(api as WebphoneAPI);
  }
}

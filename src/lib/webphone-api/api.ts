import type { WebphoneAPI, WebphoneAPIPartial } from "@/lib/webphone-api/WebphoneAPI";

let resolved = false;
let resolveApi: ((api: PromiseLike<WebphoneAPI> | WebphoneAPI) => void) | null = null;

export const webphoneAPIPromise = new Promise<WebphoneAPI>((resolve) => {
  resolveApi = resolve;
});

let apiAggregator: WebphoneAPIPartial = {};

const APIProxy: WebphoneAPI = {
  call: {
    start: (...args) =>
      apiAggregator.call?.start?.(...args) ?? Promise.resolve({ err: { message: "API not ready yet", devices: [] } }),
    startCall: (...args) =>
      apiAggregator.call?.startCall?.(...args) ??
      Promise.resolve({ err: { message: "API not ready yet", devices: [] } }),
    getCallActive: () => apiAggregator.call?.getCallActive?.(),
    getCallOutgoing: () => apiAggregator.call?.getCallOutgoing?.(),
    getOffers: () => apiAggregator.call?.getOffers?.() ?? [],
    setInput: (...args) => apiAggregator.call?.setInput?.(...args),
  },
  device: {
    getDevices: () => apiAggregator.device?.getDevices?.() ?? [],
    get: () => apiAggregator.device?.get?.() ?? [],
    addDevice: (...args) => apiAggregator.device?.addDevice?.(...args),
    add: (...args) => apiAggregator.device?.add?.(...args),
    removeDevice: (...args) => apiAggregator.device?.removeDevice?.(...args),
    remove: (...args) => apiAggregator.device?.remove?.(...args),
    enableDevice: (...args) => apiAggregator.device?.enableDevice?.(...args),
    enable: (...args) => apiAggregator.device?.enable?.(...args),
    disableDevice: (...args) => apiAggregator.device?.disableDevice?.(...args),
    disable: (...args) => apiAggregator.device?.disable?.(...args),
  },
  notifications: {
    getNotifications: () => apiAggregator.notifications?.getNotifications?.() ?? [],
    get: () => apiAggregator.notifications?.get?.() ?? [],
    addNotification: (...args) => apiAggregator.notifications?.addNotification?.(...args),
    add: (...args) => apiAggregator.notifications?.add?.(...args),
    removeNotification: (...args) => apiAggregator.notifications?.removeNotification?.(...args),
    remove: (...args) => apiAggregator.notifications?.remove?.(...args),
    clearNotifications: () => apiAggregator.notifications?.clearNotifications?.(),
    clear: () => apiAggregator.notifications?.clear?.(),
    readNotifications: () => apiAggregator.notifications?.readNotifications?.(),
    read: () => apiAggregator.notifications?.read?.(),
  },
  widget: {
    isOpen: apiAggregator.widget?.isOpen || false,
    open: () => apiAggregator.widget?.open?.(),
    close: () => apiAggregator.widget?.close?.(),
    toggle: () => apiAggregator.widget?.toggle?.(),
    buttonPosition: {
      value: apiAggregator.widget?.buttonPosition?.value ?? { x: 0, y: 0 },
      set: (...args) => apiAggregator.widget?.buttonPosition?.set?.(...args),
    },
  },
  theme: {
    value: apiAggregator.theme?.value ?? "system",
    set: (...args) => apiAggregator.theme?.set?.(...args),
    setTheme: (...args) => apiAggregator.theme?.setTheme?.(...args),
  },
  settings: {
    showNotifications: apiAggregator.settings?.showNotifications || true,
    showSettings: apiAggregator.settings?.showSettings || true,
    showDevices: apiAggregator.settings?.showDevices || true,
    showAddDevices: apiAggregator.settings?.showAddDevices || true,
    showEnableDevices: apiAggregator.settings?.showEnableDevices || true,
    showRemoveDevices: apiAggregator.settings?.showRemoveDevices || true,
    showWidgetButton: apiAggregator.settings?.showWidgetButton || true,
    setShowNotifications: (...args) => apiAggregator.settings?.setShowNotifications?.(...args),
    setShowSettings: (...args) => apiAggregator.settings?.setShowSettings?.(...args),
    setShowDevices: (...args) => apiAggregator.settings?.setShowDevices?.(...args),
    setShowAddDevices: (...args) => apiAggregator.settings?.setShowAddDevices?.(...args),
    setShowEnableDevices: (...args) => apiAggregator.settings?.setShowEnableDevices?.(...args),
    setShowRemoveDevices: (...args) => apiAggregator.settings?.setShowRemoveDevices?.(...args),
    setShowWidgetButton: (...args) => apiAggregator.settings?.setShowWidgetButton?.(...args),
  },
  position: {
    value: apiAggregator.position?.value || { x: 0, y: 0 },
    set: (...args) => apiAggregator.position?.set?.(...args),
  },
};

export function mergeToAPI(api: WebphoneAPIPartial) {
  apiAggregator = mergeAPI(apiAggregator, api);

  if (!resolved) {
    validateAPI(apiAggregator);
  }
}

function mergeAPI<T extends Record<string, unknown>>(obj1: T, obj2: T): T {
  const obj1Clean = removeNullishValuesFromObject(obj1);
  const obj2Clean = removeNullishValuesFromObject(obj2);

  for (const key in obj2Clean) {
    if (typeof obj2Clean[key] === "object") {
      obj2Clean[key] = mergeAPI(obj1Clean[key] || Object(), obj2Clean[key]);
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

function validateAPI(api: WebphoneAPIPartial) {
  if (api.call && api.notifications && api.widget && api.theme && api.settings && api.device) {
    resolved = true;
    resolveApi?.(APIProxy);
  }
}

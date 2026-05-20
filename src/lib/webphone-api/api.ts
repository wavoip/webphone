import type { WebphoneAPI, WebphoneAPIPartial } from "@/lib/webphone-api/WebphoneAPI";

let base: WebphoneAPI | null = null;
let overlay: WebphoneAPIPartial = {};
let pending = createPending();

const warnedDeprecated = new Set<string>();

/**
 * Emits a console.warn the first time a deprecated public API method is invoked.
 * Subsequent calls for the same method are silent to avoid log spam.
 */
export function warnDeprecated(method: string, replacement: string): void {
  if (warnedDeprecated.has(method)) return;
  warnedDeprecated.add(method);
  console.warn(
    `[wavoip-webphone] \`${method}\` is deprecated and will be removed in a future major release. Use \`${replacement}\` instead.`,
  );
}

/**
 * Returns the shared promise that resolves once {@link setPublicApiBase} is
 * called with a base API instance. Always returns the same promise so callers
 * can subscribe before the base is installed.
 */
export function webphoneAPIPromise(): Promise<WebphoneAPI> {
  return pending.promise;
}

/**
 * Installs the base WebphoneAPI built from the Middleware. First call resolves
 * {@link webphoneAPIPromise}; subsequent calls are no-ops so an already-resolved
 * window.wavoip is never replaced mid-flight.
 */
export function setPublicApiBase(api: WebphoneAPI): void {
  if (base) return;
  base = api;
  pending.resolve(buildOverlayView());
}

/**
 * @deprecated Layered overlay used by legacy React providers that still write
 * pieces of the public API. New code should write through the Middleware store
 * and rely on {@link setPublicApiBase} for the canonical surface.
 */
export function mergeToAPI(api: WebphoneAPIPartial): void {
  overlay = mergeAPI(overlay, api);
}

/**
 * Test-only helper: clears base, overlay, deprecation warnings and the pending
 * promise so each test starts from a clean slate.
 */
export function resetForTesting(): void {
  base = null;
  overlay = {};
  warnedDeprecated.clear();
  pending = createPending();
}

type Pending = { promise: Promise<WebphoneAPI>; resolve: (api: WebphoneAPI) => void };

function createPending(): Pending {
  let resolve!: (api: WebphoneAPI) => void;
  const promise = new Promise<WebphoneAPI>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function requireBase(): WebphoneAPI {
  if (!base) throw new Error("Public API base not installed. Call setPublicApiBase first.");
  return base;
}

function buildOverlayView(): WebphoneAPI {
  return {
    call: buildCall(),
    device: buildDevice(),
    notifications: buildNotifications(),
    widget: buildWidget(),
    theme: buildTheme(),
    settings: buildSettings(),
    position: buildPosition(),
  };
}

function buildCall(): WebphoneAPI["call"] {
  return {
    start: (to, config) => (overlay.call?.start ?? requireBase().call.start)(to, config),
    startCall: (to, fromTokens) => (overlay.call?.startCall ?? requireBase().call.startCall)(to, fromTokens),
    getCallActive: () => (overlay.call?.getCallActive ?? requireBase().call.getCallActive)(),
    getCallOutgoing: () => (overlay.call?.getCallOutgoing ?? requireBase().call.getCallOutgoing)(),
    getOffers: () => (overlay.call?.getOffers ?? requireBase().call.getOffers)(),
    setInput: (input) => (overlay.call?.setInput ?? requireBase().call.setInput)(input),
    onOffer: (cb) => (overlay.call?.onOffer ?? requireBase().call.onOffer)(cb),
  };
}

function buildDevice(): WebphoneAPI["device"] {
  return {
    get: () => (overlay.device?.get ?? requireBase().device.get)(),
    add: (token, persist) => (overlay.device?.add ?? requireBase().device.add)(token, persist),
    remove: (token) => (overlay.device?.remove ?? requireBase().device.remove)(token),
    enable: (token) => (overlay.device?.enable ?? requireBase().device.enable)(token),
    disable: (token) => (overlay.device?.disable ?? requireBase().device.disable)(token),
    getDevices: () => (overlay.device?.getDevices ?? requireBase().device.getDevices)(),
    addDevice: (token, persist) => (overlay.device?.addDevice ?? requireBase().device.addDevice)(token, persist),
    removeDevice: (token) => (overlay.device?.removeDevice ?? requireBase().device.removeDevice)(token),
    enableDevice: (token) => (overlay.device?.enableDevice ?? requireBase().device.enableDevice)(token),
    disableDevice: (token) => (overlay.device?.disableDevice ?? requireBase().device.disableDevice)(token),
  };
}

function buildNotifications(): WebphoneAPI["notifications"] {
  return {
    get: () => (overlay.notifications?.get ?? requireBase().notifications.get)(),
    add: (n) => (overlay.notifications?.add ?? requireBase().notifications.add)(n),
    remove: (id) => (overlay.notifications?.remove ?? requireBase().notifications.remove)(id),
    clear: () => (overlay.notifications?.clear ?? requireBase().notifications.clear)(),
    read: () => (overlay.notifications?.read ?? requireBase().notifications.read)(),
    getNotifications: () => (overlay.notifications?.getNotifications ?? requireBase().notifications.getNotifications)(),
    addNotification: (n) => (overlay.notifications?.addNotification ?? requireBase().notifications.addNotification)(n),
    removeNotification: (id) =>
      (overlay.notifications?.removeNotification ?? requireBase().notifications.removeNotification)(id),
    clearNotifications: () =>
      (overlay.notifications?.clearNotifications ?? requireBase().notifications.clearNotifications)(),
    readNotifications: () =>
      (overlay.notifications?.readNotifications ?? requireBase().notifications.readNotifications)(),
  };
}

function buildWidget(): WebphoneAPI["widget"] {
  return {
    get isOpen() {
      return overlay.widget?.isOpen ?? requireBase().widget.isOpen;
    },
    open: () => (overlay.widget?.open ?? requireBase().widget.open)(),
    close: () => (overlay.widget?.close ?? requireBase().widget.close)(),
    toggle: () => (overlay.widget?.toggle ?? requireBase().widget.toggle)(),
    buttonPosition: {
      get value() {
        return overlay.widget?.buttonPosition?.value ?? requireBase().widget.buttonPosition.value;
      },
      set: (pos) => (overlay.widget?.buttonPosition?.set ?? requireBase().widget.buttonPosition.set)(pos),
    },
  };
}

function buildTheme(): WebphoneAPI["theme"] {
  return {
    get value() {
      return overlay.theme?.value ?? requireBase().theme.value;
    },
    set: (theme) => (overlay.theme?.set ?? requireBase().theme.set)(theme),
    setTheme: (theme) => (overlay.theme?.setTheme ?? requireBase().theme.setTheme)(theme),
  };
}

function buildSettings(): WebphoneAPI["settings"] {
  return {
    get showNotifications() {
      return overlay.settings?.showNotifications ?? requireBase().settings.showNotifications;
    },
    get showSettings() {
      return overlay.settings?.showSettings ?? requireBase().settings.showSettings;
    },
    get showDevices() {
      return overlay.settings?.showDevices ?? requireBase().settings.showDevices;
    },
    get showAddDevices() {
      return overlay.settings?.showAddDevices ?? requireBase().settings.showAddDevices;
    },
    get showEnableDevices() {
      return overlay.settings?.showEnableDevices ?? requireBase().settings.showEnableDevices;
    },
    get showRemoveDevices() {
      return overlay.settings?.showRemoveDevices ?? requireBase().settings.showRemoveDevices;
    },
    get showWidgetButton() {
      return overlay.settings?.showWidgetButton ?? requireBase().settings.showWidgetButton;
    },
    setShowNotifications: (v) =>
      (overlay.settings?.setShowNotifications ?? requireBase().settings.setShowNotifications)(v),
    setShowSettings: (v) => (overlay.settings?.setShowSettings ?? requireBase().settings.setShowSettings)(v),
    setShowDevices: (v) => (overlay.settings?.setShowDevices ?? requireBase().settings.setShowDevices)(v),
    setShowAddDevices: (v) => (overlay.settings?.setShowAddDevices ?? requireBase().settings.setShowAddDevices)(v),
    setShowEnableDevices: (v) =>
      (overlay.settings?.setShowEnableDevices ?? requireBase().settings.setShowEnableDevices)(v),
    setShowRemoveDevices: (v) =>
      (overlay.settings?.setShowRemoveDevices ?? requireBase().settings.setShowRemoveDevices)(v),
    setShowWidgetButton: (v) =>
      (overlay.settings?.setShowWidgetButton ?? requireBase().settings.setShowWidgetButton)(v),
  };
}

function buildPosition(): WebphoneAPI["position"] {
  return {
    get value() {
      return overlay.position?.value ?? requireBase().position.value;
    },
    set: (pos) => (overlay.position?.set ?? requireBase().position.set)(pos),
  };
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

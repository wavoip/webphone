import { createStore, type StoreApi } from "zustand/vanilla";
import { createCallSlice } from "@/middleware/store/slices/callSlice";
import { createDeviceSlice } from "@/middleware/store/slices/deviceSlice";
import { createNotificationsSlice } from "@/middleware/store/slices/notificationsSlice";
import { createUiSlice } from "@/middleware/store/slices/uiSlice";
import { createWidgetSlice } from "@/middleware/store/slices/widgetSlice";
import type { MiddlewareStore } from "@/middleware/store/types";

export type MiddlewareStoreApi = StoreApi<MiddlewareStore>;

export function createMiddlewareStore(): MiddlewareStoreApi {
  return createStore<MiddlewareStore>()((...a) => ({
    ...createCallSlice(...a),
    ...createDeviceSlice(...a),
    ...createNotificationsSlice(...a),
    ...createWidgetSlice(...a),
    ...createUiSlice(...a),
  }));
}

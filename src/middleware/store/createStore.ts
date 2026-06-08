import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { createAudioSlice } from "@/middleware/store/slices/audioSlice";
import { createCallSlice } from "@/middleware/store/slices/callSlice";
import { createDeviceSlice } from "@/middleware/store/slices/deviceSlice";
import { createNotificationsSlice } from "@/middleware/store/slices/notificationsSlice";
import { createUiSlice } from "@/middleware/store/slices/uiSlice";
import { createWidgetSlice } from "@/middleware/store/slices/widgetSlice";
import type { MiddlewareStore } from "@/middleware/store/types";

export type MiddlewareStoreApi = ReturnType<typeof createMiddlewareStore>;

export function createMiddlewareStore() {
  return createStore<MiddlewareStore>()(
    subscribeWithSelector((...a) => ({
      ...createCallSlice(...a),
      ...createDeviceSlice(...a),
      ...createNotificationsSlice(...a),
      ...createWidgetSlice(...a),
      ...createUiSlice(...a),
      ...createAudioSlice(...a),
    })),
  );
}

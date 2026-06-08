import type { AudioSlice } from "@/middleware/store/slices/audioSlice";
import type { CallSlice } from "@/middleware/store/slices/callSlice";
import type { DeviceSlice } from "@/middleware/store/slices/deviceSlice";
import type { NotificationsSlice } from "@/middleware/store/slices/notificationsSlice";
import type { UiSlice } from "@/middleware/store/slices/uiSlice";
import type { WidgetSlice } from "@/middleware/store/slices/widgetSlice";

export type MiddlewareStore = CallSlice & DeviceSlice & NotificationsSlice & WidgetSlice & UiSlice & AudioSlice;

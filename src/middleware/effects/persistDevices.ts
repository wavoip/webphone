import { saveSettings } from "@/lib/device-settings";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi };
export type Unsubscribe = () => void;

export function persistDevicesEffect({ store }: Deps): Unsubscribe {
  return store.subscribe(
    (state) => state.devices,
    (devices) => saveSettings(devices),
  );
}

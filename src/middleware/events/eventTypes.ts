import type { CallActiveProps, CallOfferProps, CallOutgoingProps } from "@/lib/webphone-api/WebphoneAPI";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

/**
 * Map of programmatic events exposed via `window.wavoip.on(...)`. Add new keys
 * here when introducing a lifecycle hook; the public API surface is derived
 * from this map.
 */
export type WebphoneEventMap = {
  "call:started": CallOutgoingProps;
  "call:accepted": CallActiveProps;
  "call:ended": { id: string; status: CallStatus };
  "offer:received": CallOfferProps;
};

export type WebphoneEventName = keyof WebphoneEventMap;

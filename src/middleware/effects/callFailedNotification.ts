import { translateCallFailReason } from "@/lib/callFailReasonLabel";
import type { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { newId } from "@/middleware/controllers/NotificationsController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi; notifications: NotificationsController };
export type Unsubscribe = () => void;

/**
 * Persists a CALL_FAILED notification when an in-flight call transitions to
 * FAILED. Reason text comes from {@link callSlice.callFailReason} (populated by
 * CallController via the wavoip-api CallActive `error` event). Outgoing calls
 * never receive a reason payload from the SDK, so fall back to a generic label
 * — see CallController.bindOutgoing.
 */
export function callFailedNotificationEffect({ store, notifications }: Deps): Unsubscribe {
  return store.subscribe(
    (s) => s.callStatus,
    (status, previous) => {
      if (status !== "FAILED") return;
      if (previous === "FAILED") return;
      const state = store.getState();
      const call = state.active ?? state.outgoing;
      if (!call) return;
      notifications.add({
        id: newId(),
        type: "CALL_FAILED",
        created_at: new Date(),
        message: state.callFailReason ? translateCallFailReason(state.callFailReason) : "",
        detail: `${call.deviceToken} -> ${call.peer.phone}`,
        token: call.deviceToken,
        isHidden: false,
        isRead: false,
      });
    },
  );
}

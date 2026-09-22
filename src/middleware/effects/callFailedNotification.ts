import { type TranslationKey, t } from "@/lib/i18n";
import type { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { newId } from "@/middleware/controllers/NotificationsController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi; notifications: NotificationsController };
export type Unsubscribe = () => void;

/** Chamada de saída não recebe motivo do SDK, e a notificação sai com a mensagem vazia. */
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
        message: state.callFailReason ? t(state.callFailReason as TranslationKey) : "",
        detail: `${call.deviceToken} -> ${call.peer.phone}`,
        token: call.deviceToken,
        isHidden: false,
        isRead: false,
      });
    },
  );
}

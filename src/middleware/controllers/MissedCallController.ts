import type { Offer } from "@wavoip/wavoip-api";
import { t } from "@/lib/i18n";
import { newId } from "@/middleware/controllers/NotificationsController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

type Deps = { store: MiddlewareStoreApi };

/**
 * Direto no slice, sem localStorage: chamada perdida não sobrevive a um reload, de
 * propósito — é da sessão.
 */
export class MissedCallController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  record(offer: Offer): void {
    // Em MISSED_CALL, `message` é o rótulo do peer, para a UI montar `<rótulo> · <número>`
    // sem desmontar uma string já formatada.
    const entry: Notification = {
      id: newId(),
      type: "MISSED_CALL",
      created_at: new Date(),
      message: peerLabel(offer),
      detail: offer.peer.phone,
      token: offer.deviceToken,
      isHidden: false,
      isRead: false,
    };
    this.deps.store.getState().addNotification(entry);
  }
}

export function peerLabel(offer: Offer): string {
  const name = offer.peer.displayName?.trim();
  if (name) return name;
  const phone = offer.peer.phone.trim();
  if (phone) return phone;
  return t("Unknown");
}

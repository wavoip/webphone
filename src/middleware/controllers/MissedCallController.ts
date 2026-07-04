import type { Offer } from "@wavoip/wavoip-api";
import { t } from "@/lib/i18n";
import { newId } from "@/middleware/controllers/NotificationsController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

type Deps = { store: MiddlewareStoreApi };

/**
 * Records missed offers as in-memory notifications. Writes directly to the
 * notifications slice (no localStorage) so missed calls do not survive a
 * reload — they are session-scoped by design (see project memory
 * `project_device_persistence.md` for the same opt-in-only persistence rule
 * applied to devices).
 */
export class MissedCallController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  record(offer: Offer): void {
    // Field semantics for MISSED_CALL: `message` holds the peer label so the
    // UI can render `<label> · <phone>` without parsing a pre-formatted string.
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

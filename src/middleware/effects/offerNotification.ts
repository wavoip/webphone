import type { Offer } from "@wavoip/wavoip-api";
import type { FocusTracker } from "@/middleware/browser/focusTracker";
import type { BrowserNotifier } from "@/middleware/browser/notifier";
import type { MissedCallController } from "@/middleware/controllers/MissedCallController";
import { peerLabel } from "@/middleware/controllers/MissedCallController";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

export const OFFER_NOTIFICATION_TAG = "wavoip-offer";
const BODY_TRUNCATE_AT = 2;

type Deps = {
  store: MiddlewareStoreApi;
  notifier: BrowserNotifier;
  focus: FocusTracker;
  missedCall: MissedCallController;
  enabled?: boolean;
  icon?: string;
  onClick?: (offerId: string) => void;
};

export type Unsubscribe = () => void;

/**
 * Renders a single coalesced OS notification while offers are pending. When
 * offers leave the store, recorded missed calls (those that did not transition
 * into an active call) are pushed to the in-memory notifications slice via
 * {@link MissedCallController}. Subscribing to the entire `offers` array gives
 * us add and remove transitions in one place; ringtoneEffect uses `length`
 * because it only cares about the empty/non-empty edge.
 */
export function offerNotificationEffect(deps: Deps): Unsubscribe {
  let previous: ReadonlyArray<Offer> = deps.store.getState().offers;

  return deps.store.subscribe(
    (s) => s.offers,
    (offers) => {
      handleRemovals(offers, previous, deps);
      previous = offers;
      render(offers, deps);
    },
  );
}

function handleRemovals(curr: ReadonlyArray<Offer>, prev: ReadonlyArray<Offer>, deps: Deps): void {
  const removed = prev.filter((p) => !curr.find((c) => c.id === p.id));
  if (removed.length === 0) return;
  const active = deps.store.getState().active;
  for (const gone of removed) {
    if (active?.id === gone.id) continue;
    deps.missedCall.record(gone);
  }
}

function render(offers: ReadonlyArray<Offer>, deps: Deps): void {
  if (offers.length === 0) {
    deps.notifier.close(OFFER_NOTIFICATION_TAG);
    return;
  }
  if (deps.enabled === false) return;
  if (!deps.focus.isUnfocused()) return;
  if (deps.notifier.permission() !== "granted") return;
  const firstOffer = offers[0];
  if (!firstOffer) return;
  deps.notifier.notify({
    tag: OFFER_NOTIFICATION_TAG,
    title: buildTitle(offers),
    body: buildBody(offers),
    icon: deps.icon,
    onClick: () => deps.onClick?.(firstOffer.id),
  });
}

function buildTitle(offers: ReadonlyArray<Offer>): string {
  const first = offers[0];
  if (offers.length === 1 && first) return `Chamada de ${peerLabel(first)}`;
  return `${offers.length} chamadas recebidas`;
}

function buildBody(offers: ReadonlyArray<Offer>): string {
  const first = offers[0];
  if (offers.length === 1 && first) return first.peer.phone;
  const labels = offers.slice(0, BODY_TRUNCATE_AT).map((o) => peerLabel(o));
  const rest = offers.length - BODY_TRUNCATE_AT;
  if (rest <= 0) return labels.join(", ");
  return `${labels.join(", ")} e mais ${rest}`;
}

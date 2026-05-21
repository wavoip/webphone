import type { CallActive, Offer } from "@wavoip/wavoip-api";
import { beforeEach, describe, expect, it } from "vitest";
import type { FocusTracker } from "@/middleware/browser/focusTracker";
import type { BrowserNotifier, NotifyArgs } from "@/middleware/browser/notifier";
import { MissedCallController } from "@/middleware/controllers/MissedCallController";
import { OFFER_NOTIFICATION_TAG, offerNotificationEffect } from "@/middleware/effects/offerNotification";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeOffer, makePeer } from "@/middleware/testing/FakeWavoip";

class FakeNotifier implements BrowserNotifier {
  notifyCalls: NotifyArgs[] = [];
  closeCalls: Array<string | undefined> = [];
  currentPermission: NotificationPermission = "granted";

  notify = (args: NotifyArgs): void => {
    this.notifyCalls.push(args);
  };
  close = (tag?: string): void => {
    this.closeCalls.push(tag);
  };
  permission = (): NotificationPermission => this.currentPermission;
  requestPermission = async (): Promise<NotificationPermission> => this.currentPermission;

  reset() {
    this.notifyCalls = [];
    this.closeCalls = [];
  }
}

class FakeFocus implements FocusTracker {
  unfocused = true;
  isUnfocused = (): boolean => this.unfocused;
}

function offerWith(id: string, displayName: string | null, phone = "5511999999999"): Offer {
  const o = new FakeOffer(id, "device-1", { ...makePeer(phone), displayName });
  return o as unknown as Offer;
}

function activeWith(id: string): CallActive {
  return { id } as CallActive;
}

describe("offerNotificationEffect", () => {
  let store: MiddlewareStoreApi;
  let notifier: FakeNotifier;
  let focus: FakeFocus;
  let missedCall: MissedCallController;

  beforeEach(() => {
    store = createMiddlewareStore();
    notifier = new FakeNotifier();
    focus = new FakeFocus();
    missedCall = new MissedCallController({ store });
  });

  function start(opts: { enabled?: boolean; icon?: string; onClick?: (id: string) => void } = {}) {
    return offerNotificationEffect({ store, notifier, focus, missedCall, ...opts });
  }

  it("fires a single-offer notification when unfocused + permission granted", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    expect(notifier.notifyCalls).toHaveLength(1);
    expect(notifier.notifyCalls[0]).toMatchObject({
      tag: OFFER_NOTIFICATION_TAG,
      title: "Chamada de Maria",
      body: "5511999999999",
    });
    unsub();
  });

  it("does not fire when page is focused", () => {
    focus.unfocused = false;
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    expect(notifier.notifyCalls).toHaveLength(0);
    unsub();
  });

  it("does not fire when permission != granted", () => {
    notifier.currentPermission = "denied";
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    expect(notifier.notifyCalls).toHaveLength(0);
    unsub();
  });

  it("does not fire when enabled=false", () => {
    const unsub = start({ enabled: false });
    store.getState().addOffer(offerWith("o1", "Maria"));
    expect(notifier.notifyCalls).toHaveLength(0);
    unsub();
  });

  it("coalesces two offers — single notification with count title", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().addOffer(offerWith("o2", "João"));
    expect(notifier.notifyCalls).toHaveLength(2);
    expect(notifier.notifyCalls[1]).toMatchObject({
      tag: OFFER_NOTIFICATION_TAG,
      title: "2 chamadas recebidas",
      body: "Maria, João",
    });
    unsub();
  });

  it("truncates body at 2 peers + 'e mais N' when 3+ offers", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().addOffer(offerWith("o2", "João"));
    store.getState().addOffer(offerWith("o3", "Ana"));
    store.getState().addOffer(offerWith("o4", "Pedro"));
    const last = notifier.notifyCalls.at(-1);
    expect(last?.title).toBe("4 chamadas recebidas");
    expect(last?.body).toBe("Maria, João e mais 2");
    unsub();
  });

  it("auto-closes notification when offers reach empty", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    notifier.reset();
    store.getState().removeOffer("o1");
    expect(notifier.closeCalls).toContain(OFFER_NOTIFICATION_TAG);
    unsub();
  });

  it("does not record missed call when offer becomes the active call", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().setActive(activeWith("o1"));
    store.getState().removeOffer("o1");
    expect(store.getState().notifications).toHaveLength(0);
    unsub();
  });

  it("records missed call when offer leaves without matching active call", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().removeOffer("o1");
    const notifs = store.getState().notifications;
    expect(notifs).toHaveLength(1);
    expect(notifs[0]).toMatchObject({ type: "MISSED_CALL", message: "Maria" });
    unsub();
  });

  it("records one missed call per missed offer when multiple are dropped", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "A"));
    store.getState().addOffer(offerWith("o2", "B"));
    store.getState().removeOffer("o1");
    store.getState().removeOffer("o2");
    const missed = store.getState().notifications.filter((n) => n.type === "MISSED_CALL");
    expect(missed).toHaveLength(2);
    unsub();
  });

  it("does not record missed call when outcome is 'rejected'", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().markOfferOutcome("o1", "rejected");
    store.getState().removeOffer("o1");
    expect(store.getState().notifications).toHaveLength(0);
    unsub();
  });

  it("does not record missed call when outcome is 'accepted'", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().markOfferOutcome("o1", "accepted");
    store.getState().removeOffer("o1");
    expect(store.getState().notifications).toHaveLength(0);
    unsub();
  });

  it("does not record missed call when outcome is 'elsewhere'", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", "Maria"));
    store.getState().markOfferOutcome("o1", "elsewhere");
    store.getState().removeOffer("o1");
    expect(store.getState().notifications).toHaveLength(0);
    unsub();
  });

  it("passes through icon and invokes onClick with first offer id", () => {
    let clicked: string | undefined;
    const unsub = start({
      icon: "https://example.com/i.png",
      onClick: (id) => {
        clicked = id;
      },
    });
    store.getState().addOffer(offerWith("o1", "Maria"));
    const last = notifier.notifyCalls.at(-1);
    expect(last?.icon).toBe("https://example.com/i.png");
    last?.onClick?.();
    expect(clicked).toBe("o1");
    unsub();
  });

  it("uses 'Desconhecido' when peer has no displayName and empty phone", () => {
    const unsub = start();
    store.getState().addOffer(offerWith("o1", null, " "));
    const last = notifier.notifyCalls.at(-1);
    expect(last?.title).toBe("Chamada de Desconhecido");
    unsub();
  });
});

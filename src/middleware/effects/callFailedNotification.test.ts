import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setLanguage } from "@/lib/i18n";
import { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { callFailedNotificationEffect } from "@/middleware/effects/callFailedNotification";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing } from "@/middleware/testing/FakeWavoip";

describe("callFailedNotificationEffect", () => {
  let store: MiddlewareStoreApi;
  let notifications: NotificationsController;
  let unsubscribe: () => void;

  beforeEach(() => {
    localStorage.clear();
    store = createMiddlewareStore();
    notifications = new NotificationsController({ store });
    unsubscribe = callFailedNotificationEffect({ store, notifications });
  });

  afterEach(() => unsubscribe());

  it("adds CALL_FAILED notification when outgoing call transitions to FAILED", () => {
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    store.getState().setOutgoing(outgoing);
    store.getState().setCallStatus("CALLING");
    store.getState().setCallFailReason("PEER_UNAVAILABLE");
    store.getState().setCallStatus("FAILED");

    const list = store.getState().notifications;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      type: "CALL_FAILED",
      message: "PEER_UNAVAILABLE",
      detail: "tok-1 -> 5511999999999",
      token: "tok-1",
      isRead: false,
      isHidden: false,
    });
  });

  it("adds CALL_FAILED notification when active call transitions to FAILED", () => {
    const active = new FakeCallActive("c1", "tok-1");
    store.getState().setActive(active);
    store.getState().setCallStatus("ACTIVE");
    store.getState().setCallFailReason("ICE_FAILED");
    store.getState().setCallStatus("FAILED");

    const list = store.getState().notifications;
    expect(list).toHaveLength(1);
    expect(list[0].message).toBe("ICE_FAILED");
  });

  it("fires only once per FAILED transition (no duplicate on re-emit)", () => {
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    store.getState().setOutgoing(outgoing);
    store.getState().setCallStatus("FAILED");
    store.getState().setCallStatus("FAILED");
    expect(store.getState().notifications).toHaveLength(1);
  });

  it("uses empty message when no fail reason is available", () => {
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    store.getState().setOutgoing(outgoing);
    store.getState().setCallStatus("FAILED");
    expect(store.getState().notifications[0].message).toBe("");
  });

  it("does not fire when there is no call in flight", () => {
    store.getState().setCallStatus("FAILED");
    expect(store.getState().notifications).toHaveLength(0);
  });

  it("translates known fail reasons before storing them in the notification", () => {
    setLanguage("pt-BR");
    try {
      const active = new FakeCallActive("c1", "tok-1");
      store.getState().setActive(active);
      store.getState().setCallStatus("ACTIVE");
      store.getState().setCallFailReason("PEER_TX_TIMEOUT");
      store.getState().setCallStatus("FAILED");
      expect(store.getState().notifications[0].message).toBe("Sem áudio do contato");
    } finally {
      setLanguage("en");
    }
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

function makeNotification(id: Date, overrides: Partial<Notification> = {}): Notification {
  return {
    id,
    type: "INFO",
    created_at: id,
    message: "msg",
    detail: "detail",
    token: "tok",
    isHidden: false,
    isRead: false,
    ...overrides,
  };
}

describe("notificationsSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts with empty notifications", () => {
    expect(store.getState().notifications).toEqual([]);
  });

  it("addNotification prepends so newest is first", () => {
    const a = makeNotification(new Date(1));
    const b = makeNotification(new Date(2));
    store.getState().addNotification(a);
    store.getState().addNotification(b);
    expect(store.getState().notifications.map((n) => n.id)).toEqual([b.id, a.id]);
  });

  it("removeNotification drops the matching id", () => {
    const a = makeNotification(new Date(1));
    const b = makeNotification(new Date(2));
    store.getState().addNotification(a);
    store.getState().addNotification(b);
    store.getState().removeNotification(a.id);
    expect(store.getState().notifications.map((n) => n.id)).toEqual([b.id]);
  });

  it("clearNotifications empties the list", () => {
    store.getState().addNotification(makeNotification(new Date(1)));
    store.getState().clearNotifications();
    expect(store.getState().notifications).toEqual([]);
  });

  it("markAllNotificationsRead sets isRead=true on every entry", () => {
    store.getState().addNotification(makeNotification(new Date(1)));
    store.getState().addNotification(makeNotification(new Date(2)));
    store.getState().markAllNotificationsRead();
    expect(store.getState().notifications.every((n) => n.isRead)).toBe(true);
  });

  it("setNotifications replaces the full list", () => {
    store.getState().setNotifications([makeNotification(new Date(1)), makeNotification(new Date(2))]);
    expect(store.getState().notifications).toHaveLength(2);
    store.getState().setNotifications([]);
    expect(store.getState().notifications).toEqual([]);
  });
});

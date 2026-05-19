import { beforeEach, describe, expect, it } from "vitest";
import { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

const STORAGE_KEY = "webphone_notifications";

function makeNotification(message: string, overrides: Partial<Notification> = {}): Notification {
  return {
    id: new Date(),
    type: "INFO",
    created_at: new Date(),
    message,
    detail: "",
    token: "tok",
    isHidden: false,
    isRead: false,
    ...overrides,
  };
}

describe("NotificationsController", () => {
  let store: MiddlewareStoreApi;
  let controller: NotificationsController;

  beforeEach(() => {
    localStorage.clear();
    store = createMiddlewareStore();
    controller = new NotificationsController({ store });
  });

  it("hydrate loads notifications from localStorage", () => {
    const seed = [makeNotification("a"), makeNotification("b")];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    controller.hydrate();
    expect(store.getState().notifications.map((n) => n.message)).toEqual(["a", "b"]);
  });

  it("hydrate handles empty storage as empty list", () => {
    controller.hydrate();
    expect(store.getState().notifications).toEqual([]);
  });

  it("add pushes to store and persists to localStorage", () => {
    controller.add(makeNotification("a"));
    expect(store.getState().notifications.map((n) => n.message)).toEqual(["a"]);
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(persisted.map((n: Notification) => n.message)).toEqual(["a"]);
  });

  it("add prepends so newest is first in both store and storage", () => {
    controller.add(makeNotification("a"));
    controller.add(makeNotification("b"));
    expect(store.getState().notifications.map((n) => n.message)).toEqual(["b", "a"]);
  });

  it("remove drops by id and updates storage", () => {
    const a = makeNotification("a");
    const b = makeNotification("b");
    controller.add(a);
    controller.add(b);
    controller.remove(a.id);
    expect(store.getState().notifications.map((n) => n.message)).toEqual(["b"]);
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(persisted.map((n: Notification) => n.message)).toEqual(["b"]);
  });

  it("clear empties store and removes storage entry", () => {
    controller.add(makeNotification("a"));
    controller.clear();
    expect(store.getState().notifications).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("markAllRead flips isRead on every notification and persists", () => {
    controller.add(makeNotification("a"));
    controller.add(makeNotification("b"));
    controller.markAllRead();
    expect(store.getState().notifications.every((n) => n.isRead)).toBe(true);
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(persisted.every((n: Notification) => n.isRead)).toBe(true);
  });
});

import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

const STORAGE_KEY = "webphone_notifications";

type Deps = { store: MiddlewareStoreApi };

export class NotificationsController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  hydrate(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.deps.store.getState().setNotifications([]);
      return;
    }
    const parsed = (JSON.parse(raw) as Notification[]).map((n) => ({
      ...n,
      id: new Date(n.id),
      created_at: new Date(n.created_at),
    }));

    this.deps.store.getState().setNotifications(parsed);
  }

  add(notification: Notification): void {
    this.deps.store.getState().addNotification(notification);
    this.persist();
  }

  remove(id: Date): void {
    this.deps.store.getState().removeNotification(id);
    this.persist();
  }

  clear(): void {
    this.deps.store.getState().clearNotifications();
    localStorage.removeItem(STORAGE_KEY);
  }

  markAllRead(): void {
    this.deps.store.getState().markAllNotificationsRead();
    this.persist();
  }

  private persist(): void {
    const list = this.deps.store.getState().notifications;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

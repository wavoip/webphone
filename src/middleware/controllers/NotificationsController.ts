import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { Notification } from "@/middleware/store/slices/notificationsSlice";

const STORAGE_KEY = "webphone_notifications";

type Deps = { store: MiddlewareStoreApi };

// Legacy entries stored `id` as a Date (serialized to an ISO string by
// JSON.stringify). Coerce to a stable string id during hydrate.
type RawNotification = Omit<Notification, "id" | "created_at"> & {
  id: unknown;
  created_at: string | Date;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function coerceId(raw: unknown): string {
  // Legacy: id was a Date, JSON-serialized as an ISO string. Migrate to a
  // stable timestamp string so equality checks work after hydrate.
  if (typeof raw === "string" && ISO_DATE_RE.test(raw)) {
    const t = Date.parse(raw);
    if (!Number.isNaN(t)) return String(t);
  }
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return newId();
}

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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
    const parsed = (JSON.parse(raw) as RawNotification[]).map(
      (n): Notification => ({
        ...(n as Omit<Notification, "id" | "created_at">),
        id: coerceId(n.id),
        created_at: new Date(n.created_at),
      }),
    );

    this.deps.store.getState().setNotifications(parsed);
  }

  add(notification: Notification): void {
    this.deps.store.getState().addNotification(notification);
    this.persist();
  }

  remove(id: string): void {
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

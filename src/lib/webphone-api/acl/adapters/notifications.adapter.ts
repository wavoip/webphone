import { mergeToAPI } from "@/lib/webphone-api/api";
import { bus } from "@/lib/webphone-api/bus";
import type { NotificationsType } from "@/providers/NotificationsProvider";

const STORAGE_KEY = "webphone_notifications";
const CLEAR_HIDE_DELAY_MS = 1000;
const MAX_BEFORE_CLEAR = 100;

function load(): NotificationsType[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as NotificationsType[];
  } catch {
    return [];
  }
}

function save(list: NotificationsType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function bootNotificationsAdapter(): () => void {
  let list: NotificationsType[] = load();
  let clearTimer: ReturnType<typeof setTimeout> | null = null;

  const emit = () => bus.emit("notifications.changed", list);

  const pushToLegacyFacade = () => {
    mergeToAPI({
      notifications: {
        getNotifications: () => list,
        get: () => list,
        addNotification: (n) => add(n),
        add: (n) => add(n),
        removeNotification: (id) => remove(id),
        remove: (id) => remove(id),
        clearNotifications: () => clear(),
        clear: () => clear(),
        readNotifications: () => read(),
        read: () => read(),
      },
    });
  };

  function add(notification: NotificationsType): void {
    if (list.length > MAX_BEFORE_CLEAR) clear();
    notification.id = new Date();
    notification.created_at = new Date();
    list = [notification, ...list];
    save(list);
    emit();
    pushToLegacyFacade();
  }

  function remove(id: Date): void {
    list = list.filter((n) => n.id !== id);
    save(list);
    emit();
    pushToLegacyFacade();
  }

  function read(): void {
    list = list.map((n) => ({ ...n, isRead: true }));
    save(list);
    emit();
    pushToLegacyFacade();
  }

  function clear(): void {
    list = list.map((n) => ({ ...n, isHidden: true }));
    save(list);
    emit();
    pushToLegacyFacade();

    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      list = [];
      localStorage.removeItem(STORAGE_KEY);
      emit();
      pushToLegacyFacade();
      clearTimer = null;
    }, CLEAR_HIDE_DELAY_MS);
  }

  const unsubs: Array<() => void> = [
    bus.registerQuery("notifications.list", () => list),
    bus.handle("notifications.add", async ({ notification }) => add(notification)),
    bus.handle("notifications.remove", async ({ id }) => remove(id)),
    bus.handle("notifications.clear", async () => clear()),
    bus.handle("notifications.read", async () => read()),
  ];

  pushToLegacyFacade();
  emit();

  return () => {
    if (clearTimer) clearTimeout(clearTimer);
    for (const u of unsubs.reverse()) u();
  };
}

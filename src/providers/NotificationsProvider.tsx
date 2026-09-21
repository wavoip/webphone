import { type ReactNode, useMemo } from "react";
import { useStore } from "zustand";
import { newId } from "@/middleware/controllers/NotificationsController";
import { useMiddleware } from "@/middleware/react/hooks";
import type { Notification, NotificationInput } from "@/middleware/store/slices/notificationsSlice";

export type NotificationsType = Notification;

const MAX_NOTIFICATIONS = 100;

/** No-op: as notificações moram no store do middleware. Fica só para não mexer na árvore. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useNotificationManager() {
  const middleware = useMiddleware();
  const notifications = useStore(middleware.store, (s) => s.notifications);
  const controller = middleware.controllers.notifications;

  return useMemo(
    () => ({
      notifications,
      getNotifications: () => middleware.store.getState().notifications,
      addNotification: (input: NotificationInput): Notification => {
        if (middleware.store.getState().notifications.length > MAX_NOTIFICATIONS) {
          controller.clear();
        }
        const stamped: Notification = { ...input, id: newId(), created_at: new Date() };
        controller.add(stamped);
        return stamped;
      },
      removeNotification: (id: string) => controller.remove(id),
      readNotifications: () => controller.markAllRead(),
      clearNotifications: () => controller.clear(),
    }),
    [notifications, middleware, controller],
  );
}

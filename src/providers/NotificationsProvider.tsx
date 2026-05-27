import { type ReactNode, useMemo } from "react";
import { useStore } from "zustand";
import { newId } from "@/middleware/controllers/NotificationsController";
import { useMiddleware } from "@/middleware/react/hooks";
import type { Notification, NotificationInput } from "@/middleware/store/slices/notificationsSlice";

export type NotificationsType = Notification;

const MAX_NOTIFICATIONS = 100;

/**
 * Thin compatibility wrapper: notifications now live in the middleware store
 * and are managed by {@link NotificationsController}. Provider is a no-op so
 * existing tree structure stays intact while consumers migrate.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Returns the same shape as the legacy NotificationsContext but backed by the
 * middleware store + {@link NotificationsController}. Callers do not need to
 * change.
 */
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

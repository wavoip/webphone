import { newId } from "@/middleware/controllers/NotificationsController";
import { useMiddleware } from "@/middleware/solid/context";
import type { Notification, NotificationInput } from "@/middleware/store/slices/notificationsSlice";

export type NotificationsType = Notification;

const MAX_NOTIFICATIONS = 100;

/**
 * As notificações moram no store; isto é só o vocabulário que a tela usa. Havia um
 * provider em volta que não provia nada — o estado nunca esteve nele.
 */
export function useNotificationManager() {
  const middleware = useMiddleware();
  const state = middleware.store.getState();
  const controller = middleware.controllers.notifications;

  return {
    get notifications() {
      return state.notifications;
    },
    getNotifications: () => state.notifications,
    addNotification: (input: NotificationInput): Notification => {
      if (state.notifications.length > MAX_NOTIFICATIONS) controller.clear();
      const stamped: Notification = { ...input, id: newId(), created_at: new Date() };
      controller.add(stamped);
      return stamped;
    },
    removeNotification: (id: string) => controller.remove(id),
    readNotifications: () => controller.markAllRead(),
    clearNotifications: () => controller.clear(),
  };
}

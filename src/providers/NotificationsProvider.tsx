import { useMemo } from "react";
import { bus } from "@/lib/webphone-api/bus";
import { useBusState } from "@/lib/webphone-api/hooks/useBusState";

export type NotificationsType = {
  id: Date;
  type: "INFO" | "CALL_FAILED";
  message: string;
  detail: string;
  token: string;
  isRead: boolean;
  isHidden: boolean;
  created_at: Date;
};

type NotificationManager = {
  notifications: NotificationsType[];
  getNotifications: () => NotificationsType[];
  addNotification: (notification: NotificationsType) => void;
  removeNotification: (id: Date) => void;
  readNotifications: () => void;
  clearNotifications: () => void;
};

export function useNotificationManager(): NotificationManager {
  const notifications = useBusState("notifications.list", "notifications.changed");

  return useMemo<NotificationManager>(
    () => ({
      notifications,
      getNotifications: () => bus.query("notifications.list"),
      addNotification: (notification) => {
        void bus.request("notifications.add", { notification });
      },
      removeNotification: (id) => {
        void bus.request("notifications.remove", { id });
      },
      readNotifications: () => {
        void bus.request("notifications.read", undefined);
      },
      clearNotifications: () => {
        void bus.request("notifications.clear", undefined);
      },
    }),
    [notifications],
  );
}

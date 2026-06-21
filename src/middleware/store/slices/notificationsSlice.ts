import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

export type NotificationType =
  | "INFO"
  | "CALL_FAILED"
  | "MISSED_CALL"
  | "DEVICE_RESTRICTED"
  | "DEVICE_RESTRICTION_LIFTED";

export type Notification = {
  id: string;
  type: NotificationType;
  created_at: Date;
  message: string;
  detail: string;
  token: string;
  isHidden: boolean;
  isRead: boolean;
};

/** Caller-supplied input for `notifications.add`. `id` and `created_at` are stamped by the API. */
export type NotificationInput = Omit<Notification, "id" | "created_at">;

export type NotificationsSliceState = {
  notifications: Notification[];
};

export type NotificationsSliceActions = {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAllNotificationsRead: () => void;
};

export type NotificationsSlice = NotificationsSliceState & NotificationsSliceActions;

export const createNotificationsSlice: StateCreator<MiddlewareStore, [], [], NotificationsSlice> = (set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clearNotifications: () => set({ notifications: [] }),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
});

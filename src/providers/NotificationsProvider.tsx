import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { buildAPI } from "@/lib/webphone-api";

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

type NotificationsContextType = {
    notifications: NotificationsType[];
    getNotifications: () => void;
    addNotification: (notification: NotificationsType) => void;
    removeNotification: (id: Date) => void;
    readNotifications: () => void;
    clearNotifications: () => void;
};

const STORAGE_KEY = "webphone_notifications";

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [_notifications, setNotifications] = useState<NotificationsType[]>([]);

    const getNotifications = useCallback(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as NotificationsType[]) : [];
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications(
            _notifications.map((notification) => ({
                ...notification,
                isHidden: true,
            })),
        );

        setTimeout(() => {
            setNotifications([]);
        }, 1000);

        localStorage.removeItem(STORAGE_KEY);
    }, [_notifications]);

    const addNotification = useCallback(
        (notification: NotificationsType) => {
            if (_notifications.length > 100) {
                clearNotifications();
            }
            notification.id = new Date();
            notification.created_at = new Date();
            const notifications = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") || [];
            notifications.unshift(notification);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
            setNotifications(notifications);
        },
        [_notifications, clearNotifications],
    );

    const removeNotification = useCallback(
        (id: Date) => {
            const notifications = _notifications.filter((notification) => notification.id !== id);

            setNotifications(notifications);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        },
        [_notifications],
    );

    const readNotifications = useCallback(() => {
        const notifications = _notifications.map((notification) => ({
            ...notification,
            isRead: true,
        }));

        setNotifications(notifications);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, [_notifications]);

    useEffect(() => {
        const notifications = getNotifications();
        setNotifications(notifications);
    }, [getNotifications]);

    buildAPI({
        notifications: {
            getNotifications: getNotifications,
            clearNotifications: clearNotifications,
            addNotification: addNotification,
            removeNotification: removeNotification,
            readNotifications: readNotifications,
        },
    });

    return (
        <NotificationsContext.Provider
            value={{
                notifications: _notifications,
                getNotifications,
                addNotification,
                removeNotification,
                readNotifications,
                clearNotifications,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotificationManager() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useScreen deve ser usado dentro de <NotificationsProvider>");
    return ctx;
}

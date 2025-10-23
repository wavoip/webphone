import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";


export type NotificationsType = {
    id: Date,
    type: "INFO" | "CALL_FAILED"
    message: string,
    detail: string,
    token: string,
    isRead: boolean,
    isHidden: boolean,
    created_at: Date
};


type NotificationsContextType = {
    notifications: NotificationsType[],
    getNotifications: () => void,
    addNotification: (notification: NotificationsType) => void,
    removeNotification: (id: Date) => void,
    readNotifications: () => void,
    clearNotifications: () => void,
};

const STORAGE_KEY = "webphone_notifications";

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [_notifications, setNotifications] = useState<NotificationsType[]>([]);

    useEffect(() => {
        setNotifications(getNotifications())
    }, []);

    const getNotifications = useCallback(
        () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        },
        [_notifications, , setNotifications],
    );

    const clearNotifications = useCallback(() => {
        setNotifications(_notifications.map((notification) => ({
            ...notification,
            isHidden: true
        })));

        setTimeout(() => {
            setNotifications([]);
        }, 1000);


        localStorage.removeItem(STORAGE_KEY);
    }, [_notifications, , setNotifications]);

    const addNotification = useCallback(
        (notification: NotificationsType) => {
            if (_notifications.length > 100) {
                clearNotifications();
            }
            notification.id = new Date();
            notification.created_at = new Date();
            let notifications = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") || [];
            notifications.unshift(notification);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
            setNotifications(notifications);

        },
        [_notifications, setNotifications]
    );

    const removeNotification = useCallback(
        (id: Date) => {
            let notifications = _notifications.filter((notification) => notification.id !== id);

            setNotifications(notifications);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        },
        [_notifications, setNotifications],
    );

    const readNotifications = useCallback(() => {
        let notifications = _notifications.map((notification) => ({
            ...notification,
            isRead: true
        }));

        setNotifications(notifications);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, [_notifications, setNotifications]);



    return <NotificationsContext.Provider value={{
        notifications: _notifications,
        getNotifications,
        addNotification,
        removeNotification,
        readNotifications,
        clearNotifications
    }}>
        {children}
    </NotificationsContext.Provider>;
}

export function useNotificationManager() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useScreen deve ser usado dentro de <NotificationsProvider>");
    return ctx;
}

import { createContext, useContext, useState } from "react";
import { buildAPI } from "@/lib/webphone-api";

type SettingsProviderProps = {
    children: React.ReactNode;
};

type SettingsProviderState = {
    showNotifications: boolean;
    showSettings: boolean;
    showAudio: boolean;
    showDevices: boolean;
    showAddDevices: boolean;
    showEnableDevices: boolean;
    showRemoveDevices: boolean;
    showKeyboardScreen: boolean;
    showWidgetButton: boolean;
    setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAudio: React.Dispatch<React.SetStateAction<boolean>>;
    setShowDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAddDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowEnableDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowRemoveDevices: React.Dispatch<React.SetStateAction<boolean>>;
    setShowKeyboardScreen: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWidgetButton: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsProviderContext = createContext<SettingsProviderState | undefined>(undefined);

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [showNotifications, setShowNotifications] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(true);
    const [showAudio, setShowAudio] = useState<boolean>(true);
    const [showDevices, setShowDevices] = useState<boolean>(true);
    const [showAddDevices, setShowAddDevices] = useState<boolean>(true);
    const [showEnableDevices, setShowEnableDevices] = useState<boolean>(true);
    const [showRemoveDevices, setShowRemoveDevices] = useState<boolean>(true);
    const [showKeyboardScreen, setShowKeyboardScreen] = useState<boolean>(true);
    const [showWidgetButton, setShowWidgetButton] = useState<boolean>(true);

    buildAPI({
        settings: {
            showNotifications,
            showSettings,
            showAudio,
            showDevices,
            showAddDevices,
            showEnableDevices,
            showRemoveDevices,
            showKeyboardScreen,
            showWidgetButton,
            setShowNotifications,
            setShowSettings,
            setShowAudio,
            setShowDevices,
            setShowAddDevices,
            setShowEnableDevices,
            setShowRemoveDevices,
            setShowKeyboardScreen,
            setShowWidgetButton,
        }
    });

    return (
        <SettingsProviderContext.Provider
            value={{
                showNotifications,
                showSettings,
                showAudio,
                showDevices,
                showAddDevices,
                showEnableDevices,
                showRemoveDevices,
                showKeyboardScreen,
                showWidgetButton,
                setShowWidgetButton,
                setShowNotifications,
                setShowSettings,
                setShowAudio,
                setShowDevices,
                setShowAddDevices,
                setShowEnableDevices,
                setShowRemoveDevices,
                setShowKeyboardScreen,
            }}
        >
            {children}
        </SettingsProviderContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsProviderContext);

    if (context === undefined) throw new Error("useSettings deve ser usado dentro de SettingsProvider");

    return context;
};

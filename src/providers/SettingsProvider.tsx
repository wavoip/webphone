import { createContext, useContext, useState } from "react";
import { buildAPI } from "@/lib/webphone-api";

export type AppConfig = {
  theme?: "dark" | "light" | "system";
  statusBar?: {
    showNotificationsIcon?: boolean;
    showSettingsIcon?: boolean;
  };
  settingsMenu?: {
    deviceMenu?: {
      show?: boolean;
      showAddDevices?: boolean;
      showEnableDevicesButton?: boolean;
      showRemoveDevicesButton?: boolean;
    };
  };
  widget?: {
    showWidgetButton?: boolean;
    startOpen?: boolean;
  };
};

type SettingsProviderProps = {
  children: React.ReactNode;
  config: AppConfig;
};

type SettingsProviderState = {
  showNotifications: boolean;
  showSettings: boolean;
  showAudio: boolean;
  showDevices: boolean;
  showAddDevices: boolean;
  showEnableDevices: boolean;
  showRemoveDevices: boolean;
  showWidgetButton: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAudio: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEnableDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWidgetButton: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsProviderContext = createContext<SettingsProviderState | undefined>(undefined);

export function SettingsProvider({ children, config }: SettingsProviderProps) {
  const { statusBar, settingsMenu, widget } = config;

  const [showNotifications, setShowNotifications] = useState<boolean>(
    statusBar?.showNotificationsIcon !== undefined ? statusBar.showNotificationsIcon : true,
  );
  const [showSettings, setShowSettings] = useState<boolean>(
    statusBar?.showSettingsIcon !== undefined ? statusBar.showSettingsIcon : true,
  );
  const [showAudio, setShowAudio] = useState<boolean>(false);
  const [showDevices, setShowDevices] = useState<boolean>(
    settingsMenu?.deviceMenu?.show !== undefined ? settingsMenu.deviceMenu.show : true,
  );
  const [showAddDevices, setShowAddDevices] = useState<boolean>(
    settingsMenu?.deviceMenu?.showAddDevices !== undefined ? settingsMenu.deviceMenu.showAddDevices : true,
  );
  const [showEnableDevices, setShowEnableDevices] = useState<boolean>(
    settingsMenu?.deviceMenu?.showEnableDevicesButton !== undefined
      ? settingsMenu?.deviceMenu.showEnableDevicesButton
      : true,
  );
  const [showRemoveDevices, setShowRemoveDevices] = useState<boolean>(
    settingsMenu?.deviceMenu?.showRemoveDevicesButton !== undefined
      ? settingsMenu?.deviceMenu.showRemoveDevicesButton
      : true,
  );
  const [showWidgetButton, setShowWidgetButton] = useState<boolean>(
    widget?.showWidgetButton ? widget.showWidgetButton !== undefined : true,
  );

  buildAPI({
    settings: {
      showNotifications,
      showSettings,
      // showAudio,
      showDevices,
      showAddDevices,
      showEnableDevices,
      showRemoveDevices,
      showWidgetButton,
      setShowNotifications: (...args) => setShowNotifications(...args),
      setShowSettings: (...args) => setShowSettings(...args),
      //setShowAudio: (...args) => setShowAudio(...args),
      setShowDevices: (...args) => setShowDevices(...args),
      setShowAddDevices: (...args) => setShowAddDevices(...args),
      setShowEnableDevices: (...args) => setShowEnableDevices(...args),
      setShowRemoveDevices: (...args) => setShowRemoveDevices(...args),
      setShowWidgetButton: (...args) => setShowWidgetButton(...args),
    },
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
        showWidgetButton,
        setShowWidgetButton,
        setShowNotifications,
        setShowSettings,
        setShowAudio,
        setShowDevices,
        setShowAddDevices,
        setShowEnableDevices,
        setShowRemoveDevices,
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

import type { CallActive, CallOffer, CallOutgoing } from "@wavoip/wavoip-api";
import type React from "react";
import { createContext, useContext } from "react";
import type { CallSettings, WebphonePosition, WebphoneSettings, WidgetButtonPosition } from "@/providers/settings/settings";

type SettingsProviderProps = {
  children: React.ReactNode;
  config: WebphoneSettings;
};

type State<T> = T;

type SettingsProviderState = {
  notifications: { show: State<boolean> };
  settings: { show: State<boolean> };
  audio: { show: State<boolean> };
  devices: { show: State<boolean>; showAdd: State<boolean>; enableShow: State<boolean>; removeShow: State<boolean> };
  widget: { startOpen: boolean; show: State<boolean> };
  calls: { showNumber: State<boolean>; showName: State<boolean> };
  position: WebphonePosition;
  buttonPosition: WidgetButtonPosition;
};

const SettingsProviderContext = createContext<SettingsProviderState | undefined>(undefined);

export function showNameOrNumber(settings: CallSettings, call: CallOffer | CallActive | CallOutgoing | undefined) {
  if (!settings.showName && !settings.showNumber) return "Oculto";
  if (!settings.showName && settings.showNumber) return call?.peer?.phone;
  if (settings.showName && !settings.showNumber) return call?.peer?.displayName;
  return call?.peer?.displayName || call?.peer?.phone;
}

export function SettingsProvider({ children, config }: SettingsProviderProps) {
  const { statusBar, settingsMenu, widget } = config;

  const showNotifications = statusBar?.showNotificationsIcon ?? true;
  const showSettings = statusBar?.showSettingsIcon ?? true;

  const showAudio = false;

  const deviceMenu = settingsMenu?.deviceMenu;
  const showDevices = deviceMenu?.show || true;
  const showAddDevices = deviceMenu?.showAddDevices ?? true;
  const showEnableDevices = deviceMenu?.showEnableDevicesButton ?? true;
  const showRemoveDevices = deviceMenu?.showRemoveDevicesButton ?? true;

  const showNumber = config.callSettings?.showNumber ?? true;
  const showName = config.callSettings?.showName ?? true;

  const showWidgetButton = widget?.showWidgetButton ?? true;
  const startOpen = widget?.startOpen ?? false;
  const position: WebphonePosition = config.position ?? "bottom-right";
  const buttonPosition: WidgetButtonPosition = config.buttonPosition ?? "bottom-right";

  return (
    <SettingsProviderContext.Provider
      value={{
        notifications: { show: showNotifications },
        settings: { show: showSettings },
        audio: { show: showAudio },
        widget: {
          startOpen,
          show: showWidgetButton,
        },
        devices: {
          show: showDevices,
          showAdd: showAddDevices,
          enableShow: showEnableDevices,
          removeShow: showRemoveDevices,
        },
        calls: {
          showNumber: showNumber,
          showName: showName,
        },
        position,
        buttonPosition,
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

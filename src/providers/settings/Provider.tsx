import { createContext, type JSX, useContext } from "solid-js";
import type { WebphonePosition, WebphoneSettings, WidgetButtonPosition } from "@/providers/settings/settings";

type SettingsProviderProps = {
  children: JSX.Element;
  config: WebphoneSettings;
};

type State<T> = T;

type SettingsProviderState = {
  notifications: { show: State<boolean> };
  settings: { show: State<boolean> };
  audio: { show: State<boolean> };
  devices: { show: State<boolean>; showAdd: State<boolean>; enableShow: State<boolean>; removeShow: State<boolean> };
  widget: { startOpen: boolean; show: State<boolean> };
  callSettings: { displayName?: string };
  position: WebphonePosition;
  buttonPosition: WidgetButtonPosition;
  platform?: string;
};

const SettingsProviderContext = createContext<SettingsProviderState>();

export function SettingsProvider(props: SettingsProviderProps) {
  const { config } = props;
  const { statusBar, settingsMenu, widget } = config;

  const showNotifications = statusBar?.showNotificationsIcon ?? true;
  const showSettings = statusBar?.showSettingsIcon ?? true;

  const showAudio = false;

  const deviceMenu = settingsMenu?.deviceMenu;
  const showDevices = deviceMenu?.show || true;
  const showAddDevices = deviceMenu?.showAddDevices ?? true;
  const showEnableDevices = deviceMenu?.showEnableDevicesButton ?? true;
  const showRemoveDevices = deviceMenu?.showRemoveDevicesButton ?? true;

  const displayName = config.callSettings?.displayName;

  const showWidgetButton = widget?.showWidgetButton ?? true;
  const startOpen = widget?.startOpen ?? false;
  const position: WebphonePosition = config.position ?? "bottom-right";
  const buttonPosition: WidgetButtonPosition = config.buttonPosition ?? "bottom-right";
  const platform = config.platform;

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
        callSettings: {
          displayName: displayName,
        },
        position,
        buttonPosition,
        platform: platform || undefined,
      }}
    >
      {props.children}
    </SettingsProviderContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsProviderContext);

  if (context === undefined) throw new Error("useSettings deve ser usado dentro de SettingsProvider");

  return context;
};

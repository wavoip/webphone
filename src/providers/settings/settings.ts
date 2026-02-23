export type AppSettings = {
  theme?: Theme;
  statusBar?: StatusBarSettings;
  settingsMenu?: SettingsMenuSettings;
  widget?: WidgetSettings;
  position?: WebphonePosition;
};

export type Theme = "dark" | "light" | "system";

export type StatusBarSettings = {
  showNotificationsIcon?: boolean;
  showSettingsIcon?: boolean;
};

export type SettingsMenuSettings = {
  deviceMenu?: DeviceMenuSettings;
};

export type DeviceMenuSettings = {
  show?: boolean;
  showAddDevices?: boolean;
  showEnableDevicesButton?: boolean;
  showRemoveDevicesButton?: boolean;
};

export type WidgetSettings = {
  showWidgetButton?: boolean;
  startOpen?: boolean;
};

export type WidgetButtonPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | {
      x: number;
      y: number;
    };

export type WebphonePosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | {
      x: number;
      y: number;
    };

export type CallSettings = {
  displayName?: string;
};

export type WebphoneSettings = {
  theme?: Theme;
  statusBar?: Partial<StatusBarSettings>;
  settingsMenu?: Partial<SettingsMenuSettings>;
  widget?: Partial<WidgetSettings>;
  position?: WebphonePosition;
  buttonPosition?: WidgetButtonPosition;
  callSettings?: CallSettings;
};

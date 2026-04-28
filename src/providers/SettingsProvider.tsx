import { createContext, useContext, useEffect, useState } from "react";
import { buildAPI } from "@/lib/webphone-api";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type SettingsProviderProps = {
  children: React.ReactNode;
};

export type SettingsProviderState = {
  showNotifications: boolean;
  showSettings: boolean;
  showAudio: boolean;
  showDevices: boolean;
  showAddDevices: boolean;
  showEnableDevices: boolean;
  showRemoveDevices: boolean;
  showWidgetButton: boolean;
  showHiddenWebphone: boolean;
  isDesktop: boolean;
  settingsModalOpen: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAudio: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEnableDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveDevices: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWidgetButton: React.Dispatch<React.SetStateAction<boolean>>;
  setShowHiddenWebphone: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDesktop: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SettingsProviderContext = createContext<SettingsProviderState | undefined>(undefined);

export function SettingsProvider({ children }: SettingsProviderProps) {
  const shadowRoot = useShadowRoot();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [showAudio, setShowAudio] = useState<boolean>(false);
  const [showDevices, setShowDevices] = useState<boolean>(true);
  const [showAddDevices, setShowAddDevices] = useState<boolean>(true);
  const [showEnableDevices, setShowEnableDevices] = useState<boolean>(true);
  const [showRemoveDevices, setShowRemoveDevices] = useState<boolean>(true);
  const [showWidgetButton, setShowWidgetButton] = useState<boolean>(true);
  const [showHiddenWebphone, setShowHiddenWebphone] = useState<boolean>(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  const settings = {
    showNotifications,
    showSettings,
    showAudio,
    showDevices,
    showAddDevices,
    showEnableDevices,
    showRemoveDevices,
    showWidgetButton,
    showHiddenWebphone,
    isDesktop,
    settingsModalOpen,
    setShowWidgetButton,
    setShowNotifications,
    setShowSettings,
    setShowAudio,
    setShowDevices,
    setShowAddDevices,
    setShowEnableDevices,
    setShowRemoveDevices,
    setShowHiddenWebphone,
    setIsDesktop,
    setSettingsModalOpen,
  };

  useEffect(() => {
    if (!shadowRoot) return;

    const root = shadowRoot.querySelector("#root");

    if (!root) return;

    root.classList.remove("desktop");

    if (isDesktop) {
      root.classList.add("desktop");
      setShowDevices(false);
      setShowNotifications(false);
      setShowSettings(false);
      setShowHiddenWebphone(false);
      return;
    }
  }, [isDesktop, shadowRoot])

  buildAPI({
    settings: settings
  });

  return (
    <SettingsProviderContext.Provider
      value={settings}
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

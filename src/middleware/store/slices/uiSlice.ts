import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";
import type { Theme } from "@/providers/settings/settings";

export type Screen = "keyboard" | "outgoing" | "call";

export type UiSettings = {
  showNotifications: boolean;
  showSettings: boolean;
  showDevices: boolean;
  showAddDevices: boolean;
  showEnableDevices: boolean;
  showRemoveDevices: boolean;
  showWidgetButton: boolean;
};

export type UiSliceState = {
  screen: Screen;
  theme: Theme;
  settings: UiSettings;
  keyboardInput: string;
};

export type UiSliceActions = {
  setScreen: (screen: Screen) => void;
  setTheme: (theme: Theme) => void;
  setSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  setKeyboardInput: (input: string) => void;
  appendKeyboardChar: (ch: string) => void;
  popKeyboardChar: () => void;
};

export type UiSlice = UiSliceState & UiSliceActions;

const initialSettings: UiSettings = {
  showNotifications: true,
  showSettings: true,
  showDevices: true,
  showAddDevices: true,
  showEnableDevices: true,
  showRemoveDevices: true,
  showWidgetButton: true,
};

export const createUiSlice: StateCreator<MiddlewareStore, [], [], UiSlice> = (set) => ({
  screen: "keyboard",
  theme: "system",
  settings: initialSettings,
  keyboardInput: "",
  setScreen: (screen) => set({ screen }),
  setTheme: (theme) => set({ theme }),
  setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setKeyboardInput: (keyboardInput) => set({ keyboardInput }),
  appendKeyboardChar: (ch) => set((state) => ({ keyboardInput: state.keyboardInput + ch })),
  popKeyboardChar: () => set((state) => ({ keyboardInput: state.keyboardInput.slice(0, -1) })),
});

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
  dialStatus: string;
  dialError: string;
  dialIsLoading: boolean;
  /** Muda a cada discagem e a cada abort; o loop compara antes de cada device e para se
   *  mudou. No store, e não num ref: o Picture-in-Picture monta um segundo
   *  KeyboardScreen, e com um ref por instância o botão de abortar visível não parava o
   *  loop da outra. */
  dialToken: number;
  recentNumbers: string[];
};

export type UiSliceActions = {
  setScreen: (screen: Screen) => void;
  setTheme: (theme: Theme) => void;
  setSetting: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  setKeyboardInput: (input: string) => void;
  appendKeyboardChar: (ch: string) => void;
  popKeyboardChar: () => void;
  pushRecentNumber: (num: string) => void;
  setRecentNumbers: (numbers: string[]) => void;
  setDialStatus: (status: string) => void;
  setDialError: (error: string) => void;
  setDialIsLoading: (loading: boolean) => void;
  bumpDialToken: () => void;
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
  dialStatus: "",
  dialError: "",
  dialIsLoading: false,
  dialToken: 0,
  recentNumbers: [],
  setScreen: (screen) => set({ screen }),
  setTheme: (theme) => set({ theme }),
  setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  setKeyboardInput: (keyboardInput) => set({ keyboardInput }),
  appendKeyboardChar: (ch) => set((state) => ({ keyboardInput: state.keyboardInput + ch })),
  popKeyboardChar: () => set((state) => ({ keyboardInput: state.keyboardInput.slice(0, -1) })),
  setDialStatus: (dialStatus) => set({ dialStatus }),
  setDialError: (dialError) => set({ dialError }),
  setDialIsLoading: (dialIsLoading) => set({ dialIsLoading }),
  bumpDialToken: () => set((state) => ({ dialToken: state.dialToken + 1 })),
  pushRecentNumber: (num) =>
    set((state) => ({ recentNumbers: [num, ...state.recentNumbers.filter((n) => n !== num)].slice(0, 8) })),
  setRecentNumbers: (recentNumbers) => set({ recentNumbers }),
});

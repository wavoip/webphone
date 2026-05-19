import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

export type WidgetPoint = { x: number; y: number };

export type WidgetSliceState = {
  isClosed: boolean;
  position: WidgetPoint;
  buttonPosition: WidgetPoint;
};

export type WidgetSliceActions = {
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setWidgetPosition: (position: WidgetPoint) => void;
  setButtonPosition: (position: WidgetPoint) => void;
};

export type WidgetSlice = WidgetSliceState & WidgetSliceActions;

export const createWidgetSlice: StateCreator<MiddlewareStore, [], [], WidgetSlice> = (set) => ({
  isClosed: true,
  position: { x: 0, y: 0 },
  buttonPosition: { x: 0, y: 0 },
  openWidget: () => set({ isClosed: false }),
  closeWidget: () => set({ isClosed: true }),
  toggleWidget: () => set((state) => ({ isClosed: !state.isClosed })),
  setWidgetPosition: (position) => set({ position }),
  setButtonPosition: (buttonPosition) => set({ buttonPosition }),
});

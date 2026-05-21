import type { CallActive, CallOutgoing, Offer, CallStatus as WavoipCallStatus } from "@wavoip/wavoip-api";
import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

/**
 * Mirrors `CallStatus` from `@wavoip/wavoip-api` verbatim, plus `"idle"` for
 * the no-call resting state. Keep this in sync with the SDK's enum.
 */
export type CallStatus = WavoipCallStatus | "idle";

export type CallSliceState = {
  offers: Offer[];
  outgoing?: CallOutgoing;
  active?: CallActive;
  callStatus: CallStatus;
  peerMuted: boolean;
};

export type CallSliceActions = {
  addOffer: (offer: Offer) => void;
  removeOffer: (id: string) => void;
  setOutgoing: (call: CallOutgoing | undefined) => void;
  setActive: (call: CallActive | undefined) => void;
  setCallStatus: (status: CallStatus) => void;
  setPeerMuted: (muted: boolean) => void;
  resetCall: () => void;
};

export type CallSlice = CallSliceState & CallSliceActions;

const initialCallState: CallSliceState = {
  offers: [],
  outgoing: undefined,
  active: undefined,
  callStatus: "idle",
  peerMuted: false,
} as const;

export const createCallSlice: StateCreator<MiddlewareStore, [], [], CallSlice> = (set) => ({
  ...initialCallState,
  addOffer: (offer) => set((state) => ({ offers: [...state.offers, offer] })),
  removeOffer: (id) => set((state) => ({ offers: state.offers.filter((o) => o.id !== id) })),
  setOutgoing: (outgoing) => set({ outgoing }),
  setActive: (active) => set({ active }),
  setCallStatus: (callStatus) => set({ callStatus }),
  setPeerMuted: (peerMuted) => set({ peerMuted }),
  resetCall: () => set({ ...initialCallState }),
});

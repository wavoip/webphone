import type { CallActive, CallOutgoing, Offer } from "@wavoip/wavoip-api";
import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "active"
  | "reconnecting"
  | "ended"
  | "failed"
  | "rejected"
  | "unanswered";

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
};

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

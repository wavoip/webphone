import type { CallActive, CallOutgoing, Offer, CallStatus as WavoipCallStatus } from "@wavoip/wavoip-api";
import type { StateCreator } from "zustand";
import type { MiddlewareStore } from "@/middleware/store/types";

/**
 * Mirrors `CallStatus` from `@wavoip/wavoip-api` verbatim, plus `"idle"` for
 * the no-call resting state. Keep this in sync with the SDK's enum.
 */
export type CallStatus = WavoipCallStatus | "idle";

/**
 * Records how an offer left the store so the missed-call detector can ignore
 * outcomes that are not truly "missed". Absence of an outcome means the offer
 * ended without explicit user action (peer ended, timed out) → counted as
 * missed.
 */
export type OfferOutcome = "accepted" | "rejected" | "elsewhere";

export type CallSliceState = {
  offers: Offer[];
  outgoing?: CallOutgoing;
  active?: CallActive;
  callStatus: CallStatus;
  peerMuted: boolean;
  callFailReason?: string;
  lastOfferOutcomes: Record<string, OfferOutcome>;
};

export type CallSliceActions = {
  addOffer: (offer: Offer) => void;
  removeOffer: (id: string) => void;
  setOutgoing: (call: CallOutgoing | undefined) => void;
  setActive: (call: CallActive | undefined) => void;
  setCallStatus: (status: CallStatus) => void;
  setPeerMuted: (muted: boolean) => void;
  setCallFailReason: (reason: string | undefined) => void;
  markOfferOutcome: (id: string, outcome: OfferOutcome) => void;
  resetCall: () => void;
};

export type CallSlice = CallSliceState & CallSliceActions;

const initialCallState: CallSliceState = {
  offers: [],
  outgoing: undefined,
  active: undefined,
  callStatus: "idle",
  peerMuted: false,
  callFailReason: undefined,
  lastOfferOutcomes: {},
} as const;

export const createCallSlice: StateCreator<MiddlewareStore, [], [], CallSlice> = (set) => ({
  ...initialCallState,
  addOffer: (offer) => set((state) => ({ offers: [...state.offers, offer] })),
  removeOffer: (id) => set((state) => ({ offers: state.offers.filter((o) => o.id !== id) })),
  setOutgoing: (outgoing) => set({ outgoing }),
  setActive: (active) => set({ active }),
  setCallStatus: (callStatus) => set({ callStatus }),
  setPeerMuted: (peerMuted) => set({ peerMuted }),
  setCallFailReason: (callFailReason) => set({ callFailReason }),
  markOfferOutcome: (id, outcome) =>
    set((state) => ({ lastOfferOutcomes: { ...state.lastOfferOutcomes, [id]: outcome } })),
  resetCall: () => set({ ...initialCallState, lastOfferOutcomes: {} }),
});

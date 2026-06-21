import type { CallActive, CallOutgoing, CallPeer, Offer, Wavoip } from "@wavoip/wavoip-api";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { OfferOutcome } from "@/middleware/store/slices/callSlice";

type Deps = { wavoip: Wavoip; store: MiddlewareStoreApi };

export type StartCallSuccess = { call: { id: string; peer: CallPeer }; err: null };
export type StartCallFailure = {
  call: null;
  err: { message: string; devices: { token: string; reason: string }[] };
};
export type StartCallResult = StartCallSuccess | StartCallFailure;

export class CallController {
  private readonly deps: Deps;

  constructor(deps: Deps) {
    this.deps = deps;
  }

  async start(to: string, config: { fromTokens?: string[] } = {}): Promise<StartCallResult> {
    const fromTokens = config.fromTokens ?? this.enabledTokens();
    const { call, err } = await this.deps.wavoip.startCall({ fromTokens, to });
    if (err) return { call: null, err };

    this.bindOutgoing(call);
    const { store } = this.deps;
    store.getState().setOutgoing(call);
    store.getState().setCallStatus("CALLING");

    return { call: { id: call.id, peer: call.peer }, err: null };
  }

  /**
   * Ends the currently active or outgoing call and flips status to "ENDED"
   * immediately. wavoip-api's call.end() does not emit "ended" locally — it
   * only fires when the server confirms — so the UI would otherwise stay on
   * the running duration until the WSS round-trip lands.
   */
  async end(): Promise<{ err: string | null }> {
    const { store } = this.deps;
    const { active, outgoing } = store.getState();
    const call = active ?? outgoing;
    if (!call) return { err: null };
    const result = await call.end();
    store.getState().setCallStatus("ENDED");
    return result;
  }

  ingestOffer(offer: Offer): void {
    this.deps.store.getState().addOffer(this.wrapOffer(offer));
    offer.on("ended", () => this.dropOffer(offer.id));
    offer.on("acceptedElsewhere", () => this.dropOfferWithOutcome(offer.id, "elsewhere"));
    offer.on("rejectedElsewhere", () => this.dropOfferWithOutcome(offer.id, "elsewhere"));
    offer.on("unanswered", () => this.dropOffer(offer.id));
  }

  private wrapOffer(offer: Offer): Offer {
    const originalAccept = offer.accept.bind(offer);
    const originalReject = offer.reject.bind(offer);
    return new Proxy(offer, {
      get: (target, prop, receiver) => {
        if (prop === "accept") {
          return async () => {
            const result = await originalAccept();
            if (result.call) this.promoteToActive(result.call, offer.id);
            return result;
          };
        }
        // wavoip-api's offer.reject() does not emit "ended" locally — it only
        // fires when the server confirms. Drop optimistically on success so
        // the ringtone effect (subscribed to offers.length) stops immediately.
        if (prop === "reject") {
          return async () => {
            const result = await originalReject();
            if (!result.err) this.dropOfferWithOutcome(offer.id, "rejected");
            return result;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  private promoteToActive(call: CallActive, offerId: string): void {
    const { store } = this.deps;
    store.getState().markOfferOutcome(offerId, "accepted");
    store.getState().removeOffer(offerId);
    this.bindActive(call);
    store.getState().setActive(call);
    store.getState().setCallStatus("ACTIVE");
    store.getState().setPeerMuted(call.peer.muted ?? false);
  }

  private dropOffer(id: string): void {
    this.deps.store.getState().removeOffer(id);
  }

  private dropOfferWithOutcome(id: string, outcome: OfferOutcome): void {
    this.deps.store.getState().markOfferOutcome(id, outcome);
    this.deps.store.getState().removeOffer(id);
  }

  private bindOutgoing(call: CallOutgoing): void {
    const { store } = this.deps;
    call.on("peerAccept", (active) => {
      store.getState().setOutgoing(undefined);
      this.bindActive(active);
      store.getState().setActive(active);
      store.getState().setCallStatus("ACTIVE");
      store.getState().setPeerMuted(active.peer.muted ?? false);
    });
    call.on("peerReject", () => store.getState().setCallStatus("REJECTED"));
    call.on("unanswered", () => store.getState().setCallStatus("NOT_ANSWERED"));
    call.on("ended", () => store.getState().setCallStatus("ENDED"));
    call.on("status", (status) => store.getState().setCallStatus(status));
  }

  private bindActive(call: CallActive): void {
    const { store } = this.deps;
    call.on("ended", () => store.getState().setCallStatus("ENDED"));
    call.on("peerMute", () => store.getState().setPeerMuted(true));
    call.on("peerUnmute", () => store.getState().setPeerMuted(false));
    call.on("status", (status) => store.getState().setCallStatus(status));
  }

  private enabledTokens(): string[] {
    return this.deps.store
      .getState()
      .devices.filter((d) => d.enable)
      .map((d) => d.token);
  }
}

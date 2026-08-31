import type { CallActive, CallOutgoing, CallPeer, Offer, Wavoip } from "@wavoip/wavoip-api";
import { isTerminalCallStatus } from "@/middleware/store/callStatus";
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
    store.getState().setCallFailReason(undefined);
    store.getState().setOutgoing(call);
    store.getState().setCallStatus("CALLING");

    return { call: { id: call.id, peer: call.peer }, err: null };
  }

  /**
   * Ends the currently active call, or cancels the outgoing one, flipping the
   * status as soon as the call is handed over. wavoip-api does not emit the
   * terminal event locally — it only fires when the server confirms — so the UI
   * would otherwise stay on the running duration until the WSS round-trip lands.
   */
  async end(): Promise<{ err: string | null }> {
    const { store } = this.deps;
    const { active, outgoing } = store.getState();
    if (!active) return outgoing ? this.cancel() : { err: null };
    const result = await active.end();
    store.getState().setCallStatus("ENDED");
    return result;
  }

  /**
   * Gives up an outgoing call before the peer answers. Unlike hanging up an
   * active call, this can legitimately fail — the peer may answer in the same
   * instant, and the server then refuses with IS_NOT_OFFER.
   *
   * The status is written only once the server confirms. Marking it terminal
   * up-front and rolling back on failure does not work: a terminal status arms
   * every terminal effect — the reset timer that wipes the call, the public
   * `call:ended` broadcast — and a later rollback cannot disarm what already
   * fired, so a refused cancellation erased a call that was still ringing. The
   * "cancelling" feedback belongs to the button, not to the call status.
   *
   * @example await controllers.call.cancel()          // whatever is outgoing now
   * @example await controllers.call.cancel(call.id)   // only if it is still that one
   */
  async cancel(callId?: string): Promise<{ err: string | null }> {
    const { store } = this.deps;
    const { outgoing } = store.getState();
    if (!outgoing) return { err: null };
    // A late abort must not cancel whatever happens to be in the store by then —
    // the operator may already have dialled again.
    if (callId !== undefined && outgoing.id !== callId) return { err: null };

    const result = await outgoing.cancel();
    if (result.err === null) store.getState().setCallStatus("CANCELLED");
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
    // Safety net, not the main path: every server-routed ending arrives as a
    // `status` settled before the terminal event, and hardcoding "ENDED" here
    // used to overwrite "CANCELLED" and make a cancellation look like a hangup.
    // But one path emits `ended` with no status at all — the media handover
    // failing after `call:answered` — and without this the call would sit
    // non-terminal forever: screen stuck, no public event, no reset.
    call.on("ended", () => {
      const { callStatus } = store.getState();
      if (!isTerminalCallStatus(callStatus)) store.getState().setCallStatus("ENDED");
    });
    call.on("status", (status) => store.getState().setCallStatus(status));
  }

  private bindActive(call: CallActive): void {
    const { store } = this.deps;
    call.on("ended", () => store.getState().setCallStatus("ENDED"));
    call.on("peerMute", () => store.getState().setPeerMuted(true));
    call.on("peerUnmute", () => store.getState().setPeerMuted(false));
    call.on("status", (status) => store.getState().setCallStatus(status));
    // wavoip-api maps the `call:failed` socket reason payload to the
    // CallActive `error` event. Persist it so the UI can render the cause
    // and the CALL_FAILED notification effect can include it.
    call.on("error", (reason) => store.getState().setCallFailReason(reason));
  }

  private enabledTokens(): string[] {
    return this.deps.store
      .getState()
      .devices.filter((d) => d.enable)
      .map((d) => d.token);
  }
}

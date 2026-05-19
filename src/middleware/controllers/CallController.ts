import type { CallActive, CallOutgoing, CallPeer, Offer, Wavoip } from "@wavoip/wavoip-api";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

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
    store.getState().setCallStatus("calling");

    return { call: { id: call.id, peer: call.peer }, err: null };
  }

  ingestOffer(offer: Offer): void {
    this.deps.store.getState().addOffer(this.wrapOffer(offer));
    offer.on("ended", () => this.dropOffer(offer.id));
    offer.on("acceptedElsewhere", () => this.dropOffer(offer.id));
    offer.on("rejectedElsewhere", () => this.dropOffer(offer.id));
    offer.on("unanswered", () => this.dropOffer(offer.id));
  }

  private wrapOffer(offer: Offer): Offer {
    const originalAccept = offer.accept.bind(offer);
    return new Proxy(offer, {
      get: (target, prop, receiver) => {
        if (prop === "accept") {
          return async () => {
            const result = await originalAccept();
            if (result.call) this.promoteToActive(result.call, offer.id);
            return result;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  private promoteToActive(call: CallActive, offerId: string): void {
    const { store } = this.deps;
    store.getState().removeOffer(offerId);
    this.bindActive(call);
    store.getState().setActive(call);
    store.getState().setCallStatus("active");
    store.getState().setPeerMuted(call.peer.muted ?? false);
  }

  private dropOffer(id: string): void {
    this.deps.store.getState().removeOffer(id);
  }

  private bindOutgoing(call: CallOutgoing): void {
    const { store } = this.deps;
    call.on("peerAccept", (active) => {
      store.getState().setOutgoing(undefined);
      this.bindActive(active);
      store.getState().setActive(active);
      store.getState().setCallStatus("active");
      store.getState().setPeerMuted(active.peer.muted ?? false);
    });
    call.on("peerReject", () => store.getState().setCallStatus("rejected"));
    call.on("unanswered", () => store.getState().setCallStatus("unanswered"));
    call.on("ended", () => store.getState().setCallStatus("ended"));
    call.on("status", (status) => {
      if (status === "CALLING") store.getState().setCallStatus("calling");
      if (status === "RINGING") store.getState().setCallStatus("ringing");
      if (status === "FAILED") store.getState().setCallStatus("failed");
    });
  }

  private bindActive(call: CallActive): void {
    const { store } = this.deps;
    call.on("ended", () => store.getState().setCallStatus("ended"));
    call.on("peerMute", () => store.getState().setPeerMuted(true));
    call.on("peerUnmute", () => store.getState().setPeerMuted(false));
    call.on("status", (status) => {
      store.getState().setCallStatus(status === "DISCONNECTED" ? "reconnecting" : "active");
    });
  }

  private enabledTokens(): string[] {
    return this.deps.store.getState().devices.filter((d) => d.enable).map((d) => d.token);
  }
}

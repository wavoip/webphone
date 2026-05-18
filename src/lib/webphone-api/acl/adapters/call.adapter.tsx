import { toast } from "sonner";
import { OfferNotification } from "@/components/OfferNotification";
import { pictureInPicture } from "@/lib/picture-in-picture";
import { bus } from "@/lib/webphone-api/bus";
import type { CallStatus } from "@/lib/webphone-api/events";
import type { CallActive, CallOutgoing, Offer, Wavoip } from "@/lib/webphone-api/sdk-types";
import type { CallOfferProps } from "@/lib/webphone-api/WebphoneAPI";
import type { CallSettings } from "@/providers/settings/settings";

type CallAdapterConfig = {
  wavoip: Wavoip;
  callSettings?: CallSettings;
};

function toOfferProps(o: Offer): CallOfferProps {
  const { id, type, status, device_token, direction, peer } = o;
  return { id, type, status, device_token, direction, peer };
}

export function bootCallAdapter({ wavoip, callSettings }: CallAdapterConfig): () => void {
  let offers: Offer[] = [];
  let outgoing: CallOutgoing | undefined;
  let active: CallActive | undefined;
  let callStatus: CallStatus = "idle";
  let peerMuted = false;
  let widgetWasClosed: boolean | null = null;

  const setStatus = (s: CallStatus) => {
    callStatus = s;
    bus.emit("call.status.changed", s);
  };
  const setPeerMuted = (v: boolean) => {
    peerMuted = v;
    bus.emit("call.peer.muted.changed", v);
  };
  const setActive = (c: CallActive | undefined) => {
    active = c;
    bus.emit("call.active.changed", c);
  };
  const setOutgoing = (c: CallOutgoing | undefined) => {
    outgoing = c;
    bus.emit("call.outgoing.changed", c);
  };
  const emitOffers = () => bus.emit("offer.list.changed", offers);

  function onCallEnd(status: CallStatus = "ended"): void {
    bus.emit("fx.unloadConfirm.disable", undefined);
    bus.emit("fx.pip.disable", undefined);
    setStatus(status);
    setPeerMuted(false);

    setTimeout(() => {
      if (widgetWasClosed !== null) {
        void bus.request("widget.setIsClosed", { isClosed: widgetWasClosed });
        widgetWasClosed = null;
      }
      bus.emit("fx.screen.set", "keyboard");
      setOutgoing(undefined);
      setActive(undefined);
      setStatus("idle");
      pictureInPicture.call = null;
    }, 3000);
  }

  function onCallError(callId: string, deviceToken: string, error: string): void {
    void bus.request("notifications.add", {
      notification: {
        id: new Date(),
        type: "CALL_FAILED",
        created_at: new Date(),
        message: error,
        detail: `Chamada: ${callId}`,
        isHidden: false,
        isRead: false,
        token: deviceToken,
      },
    });
  }

  function onCallAccept(call: CallActive): CallActive {
    call.on("ended", () => onCallEnd("ended"));
    call.on("error", (error) => onCallError(call.id, call.device_token, error));
    call.on("peerMute", () => setPeerMuted(true));
    call.on("peerUnmute", () => setPeerMuted(false));
    call.on("status", (status) => {
      if (status === "DISCONNECTED") setStatus("reconnecting");
      else setStatus("active");
    });

    bus.emit("fx.screen.set", "call");
    setActive(call);
    setStatus("active");
    setPeerMuted(call.peer.muted || false);
    pictureInPicture.call = call;

    return call;
  }

  function handleOffer(offer: Offer): void {
    if (active) return;

    if (callSettings?.displayName) {
      offer.peer.displayName = callSettings.displayName;
      offer.peer.phone = callSettings.displayName;
    }

    const onOfferEnd = () => {
      offers = offers.filter(({ id }) => id !== offer.id);
      if (!offers.length) bus.emit("fx.ringtone.stop", undefined);
      emitOffers();
      bus.emit("offer.ended", { id: offer.id });
      setTimeout(() => toast.dismiss(offer.id), 2000);
    };

    offer.on("ended", onOfferEnd);
    offer.on("acceptedElsewhere", onOfferEnd);
    offer.on("rejectedElsewhere", onOfferEnd);
    offer.on("unanswered", onOfferEnd);

    const originalAccept = offer.accept.bind(offer);
    const originalReject = offer.reject.bind(offer);

    const integrated: Offer = {
      ...offer,
      async accept() {
        const result = await originalAccept();
        if (!result.call) return result;

        offers = [];
        emitOffers();
        bus.emit("fx.ringtone.stop", undefined);
        widgetWasClosed = !bus.query("widget.isOpen");
        void bus.request("widget.open", undefined);

        onCallAccept(result.call);
        return result;
      },
      async reject() {
        const result = await originalReject();
        if (!result.err) bus.emit("fx.ringtone.stop", undefined);
        return result;
      },
    };

    offers = [...offers, integrated];
    emitOffers();

    bus.emit("offer.received", toOfferProps(offer));

    bus.emit("fx.ringtone.start", undefined);

    toast(<OfferNotification offer={integrated} />, {
      id: offer.id,
      duration: 100_000,
      className: "wv:max-w-[400px] wv:!w-full",
    });
  }

  async function start(payload: { to: string; fromTokens?: string[]; displayName?: string }) {
    const devices = bus.query("device.list");
    const fromTokens = payload.fromTokens ?? devices.filter((d) => d.enable).map((d) => d.token);

    const { call, err } = await wavoip.startCall({ fromTokens, to: payload.to });
    if (err) return { call: null, err };

    const overrideName = payload.displayName ?? callSettings?.displayName;
    if (overrideName) {
      call.peer.displayName = overrideName;
      call.peer.phone = overrideName;
    }

    call.on("peerAccept", (activeCall) => {
      onCallAccept(activeCall);
      setOutgoing(undefined);
    });
    call.on("unanswered", () => onCallEnd("unanswered"));
    call.on("ended", () => onCallEnd("ended"));
    call.on("peerReject", () => onCallEnd("rejected"));
    call.on("status", (status) => {
      if (status === "CALLING") setStatus("calling");
      if (status === "RINGING") setStatus("ringing");
      if (status === "FAILED") onCallEnd("failed");
    });

    widgetWasClosed = !bus.query("widget.isOpen");
    void bus.request("widget.open", undefined);
    setOutgoing(call);
    bus.emit("fx.screen.set", "outgoing");
    setStatus("calling");
    bus.emit("fx.unloadConfirm.enable", undefined);
    pictureInPicture.call = call;

    return { call: { id: call.id, peer: call.peer }, err: null };
  }

  const unsubOffer = wavoip.on("offer", (o) => handleOffer(o));

  const unsubs: Array<() => void> = [
    bus.registerQuery("call.active", () => active),
    bus.registerQuery("call.outgoing", () => outgoing),
    bus.registerQuery("call.status", () => callStatus),
    bus.registerQuery("call.peerMuted", () => peerMuted),
    bus.registerQuery("call.offers", () => offers),
    bus.handle("call.start", async (payload) => start(payload)),
    bus.handle("offer.accept", async ({ id }) => {
      const offer = offers.find((o) => o.id === id);
      if (!offer) return { call: null, err: { message: `Offer ${id} not found` } };
      const result = await offer.accept();
      if (result.err) return { call: null, err: { message: result.err } };
      if (!result.call) return { call: null, err: { message: "Offer accept returned no call" } };
      return { call: { id: result.call.id, peer: result.call.peer }, err: null };
    }),
    bus.handle("offer.reject", async ({ id }) => {
      const offer = offers.find((o) => o.id === id);
      if (!offer) return { err: { message: `Offer ${id} not found` } };
      const result = await offer.reject();
      if (result.err) return { err: { message: result.err } };
      return { err: null };
    }),
  ];

  return () => {
    unsubOffer?.();
    for (const u of unsubs.reverse()) u();
  };
}

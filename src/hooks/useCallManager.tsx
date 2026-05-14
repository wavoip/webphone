import type { CallActive, CallOutgoing, Offer, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { OfferNotification } from "@/components/OfferNotification";
import type { DeviceState } from "@/hooks/useDeviceManager";
import { disablePiP, enablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import type { CallOfferProps } from "@/lib/webphone-api/WebphoneAPI";
import { useNotificationManager } from "@/providers/NotificationsProvider";
import { useScreen } from "@/providers/ScreenProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWidget } from "@/providers/WidgetProvider";

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

type Props = {
  wavoip: Wavoip;
  devices: DeviceState[];
  onOffer: (offer: CallOfferProps) => void;
};

const ringtone_sound = new Audio(Ringtone);
const vibration_sound = new Audio(Vibration);
let widgetStatusCache: null | boolean = null;

export function useCallManager({ wavoip, devices, onOffer: onOfferExternal }: Props) {
  const { setScreen } = useScreen();
  const { isClosed: widgetIsClosed, setIsClosed: setWidgetClosed, open: openWidget } = useWidget();
  const { addNotification } = useNotificationManager();
  const { callSettings } = useSettings();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [outgoing, setOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [active, setActive] = useState<CallActive | undefined>(undefined);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [peerMuted, setPeerMuted] = useState(false);

  const onCallEnd = useCallback(
    (status: CallStatus = "ended") => {
      disableConfirmClose();
      disablePiP();
      setCallStatus(status);
      setPeerMuted(false);

      setTimeout(() => {
        if (widgetStatusCache) {
          setWidgetClosed(widgetStatusCache);
          widgetStatusCache = null;
        }

        setScreen("keyboard");
        setOutgoing(undefined);
        setActive(undefined);
        setCallStatus("idle");
        pictureInPicture.call = null;
      }, 3000);
    },
    [setScreen, setWidgetClosed],
  );

  const onCallError = useCallback(
    (callId: string, deviceToken: string, error: string) => {
      addNotification({
        id: new Date(),
        type: "CALL_FAILED",
        created_at: new Date(),
        message: error,
        detail: `Chamada: ${callId}`,
        isHidden: false,
        isRead: false,
        token: deviceToken,
      });
    },
    [addNotification],
  );

  const onCallAccept = useCallback(
    (call: CallActive) => {
      call.on("ended", () => onCallEnd("ended"));
      call.on("error", (error) => onCallError(call.id, call.device_token, error));
      call.on("peerMute", () => setPeerMuted(true));
      call.on("peerUnmute", () => setPeerMuted(false));
      call.on("status", (status) => {
        if (status === "DISCONNECTED") {
          setCallStatus("reconnecting");
        } else {
          setCallStatus("active");
        }
      });

      setScreen("call");
      setActive(call);
      setCallStatus("active");
      setPeerMuted(call.peer.muted || false);
      pictureInPicture.call = call;

      return call;
    },
    [onCallEnd, setScreen, onCallError],
  );

  const onOffer = useCallback(
    (offer: Offer) => {
      if (active) return;

      if (callSettings?.displayName) {
        offer.peer.displayName = callSettings.displayName;
        offer.peer.phone = callSettings.displayName;
      }

      function onOfferEnd() {
        setOffers((prev) => {
          const remaining = prev.filter(({ id }) => id !== offer.id);
          if (!remaining.length) stopRingtone();
          return remaining;
        });

        setTimeout(() => {
          toast.dismiss(offer.id);
        }, 2000);
      }

      offer.on("ended", () => onOfferEnd());
      offer.on("acceptedElsewhere", () => onOfferEnd());
      offer.on("rejectedElsewhere", () => onOfferEnd());
      offer.on("unanswered", () => onOfferEnd());

      const originalAccept = offer.accept.bind(offer);
      const originalReject = offer.reject.bind(offer);

      const offerIntegrated: Offer = {
        ...offer,
        async accept() {
          const result = await originalAccept();

          if (!result.call) return result;

          setOffers([]);
          stopRingtone();
          enablePiP();
          openWidget();
          widgetStatusCache = widgetIsClosed;

          onCallAccept(result.call);
          return result;
        },
        async reject() {
          const result = await originalReject();

          if (!result.err) stopRingtone();

          return result;
        },
      };

      setOffers((prev) => [...prev, offerIntegrated]);
      onOfferExternal({
        id: offer.id,
        type: offer.type,
        status: offer.status,
        device_token: offer.device_token,
        direction: offer.direction,
        peer: offer.peer,
      });

      startRingtone();

      toast(<OfferNotification offer={offerIntegrated} />, {
        id: offer.id,
        duration: 100_000,
        className: "wv:max-w-[400px] wv:!w-full",
      });
    },
    [widgetIsClosed, active, onCallAccept, openWidget, onOfferExternal, callSettings.displayName],
  );

  const start = useCallback(
    async (to: string, config: { fromTokens?: string[] } = {}) => {
      const { call, err } = await wavoip.startCall({
        fromTokens: config.fromTokens ?? devices.filter((device) => device.enable).map((device) => device.token),
        to,
      });

      if (err) {
        return { err };
      }

      if (callSettings?.displayName) {
        call.peer.displayName = callSettings.displayName;
        call.peer.phone = callSettings.displayName;
      }

      call.on("peerAccept", (activeCall) => {
        onCallAccept(activeCall);
        setOutgoing(undefined);
      });

      call.on("unanswered", () => onCallEnd("unanswered"));
      call.on("ended", () => onCallEnd("ended"));
      call.on("peerReject", () => onCallEnd("rejected"));

      call.on("status", (status) => {
        if (status === "CALLING") setCallStatus("calling");
        if (status === "RINGING") setCallStatus("ringing");
        if (status === "FAILED") onCallEnd("failed");
      });

      widgetStatusCache = widgetIsClosed;
      openWidget();
      setOutgoing(call);
      setScreen("outgoing");
      setCallStatus("calling");
      enableConfirmClose();
      enablePiP();
      pictureInPicture.call = call;

      return { err: null };
    },
    [
      devices,
      onCallAccept,
      onCallEnd,
      setScreen,
      wavoip.startCall,
      openWidget,
      widgetIsClosed,
      callSettings.displayName,
    ],
  );

  const onOfferRef = useRef(onOffer);
  onOfferRef.current = onOffer;

  useEffect(() => {
    const unsub = wavoip.on("offer", (offer) => onOfferRef.current(offer));
    return () => unsub?.();
  }, [wavoip]);

  return { offers, outgoing, active, start, callStatus, peerMuted };
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
  return "";
}

function enableConfirmClose() {
  window.addEventListener("beforeunload", handleBeforeUnload);
}

function disableConfirmClose() {
  window.removeEventListener("beforeunload", handleBeforeUnload);
}

function startRingtone() {
  ringtone_sound.currentTime = 0;
  ringtone_sound.loop = true;
  ringtone_sound.volume = 0.25;
  ringtone_sound.play();

  vibration_sound.loop = true;
  vibration_sound.currentTime = 0;
  vibration_sound.volume = 0.25;
  vibration_sound.play();
}

function stopRingtone() {
  ringtone_sound.pause();
  vibration_sound.pause();
}

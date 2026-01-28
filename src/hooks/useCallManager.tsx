import type { CallActive, CallOffer, CallOutgoing, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { OfferNotification } from "@/components/OfferNotification";
import type { DeviceState } from "@/hooks/useDeviceManager";
import { disablePiP, enablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { useNotificationManager } from "@/providers/NotificationsProvider";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";

type Props = {
  wavoip: Wavoip;
  devices: DeviceState[];
};

const ringtone_sound = new Audio(Ringtone);
const vibration_sound = new Audio(Vibration);
let widgetStatusCache: null | boolean = null;

export function useCallManager({ wavoip, devices }: Props) {
  const { setScreen } = useScreen();
  const { isClosed: widgetIsClosed, setIsClosed: setWidgetClosed, open: openWidget } = useWidget();
  const { addNotification } = useNotificationManager();

  const [offers, setOffers] = useState<CallOffer[]>([]);
  const [outgoing, setOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [active, setActive] = useState<CallActive | undefined>(undefined);

  const onCallEnd = useCallback(() => {
    disableConfirmClose();
    disablePiP();

    setTimeout(() => {
      if (widgetStatusCache) {
        setWidgetClosed(widgetStatusCache);
        widgetStatusCache = null;
      }

      setScreen("keyboard");
      setOutgoing(undefined);
      setActive(undefined);
      pictureInPicture.call = null;
    }, 3000);
  }, [setScreen, setWidgetClosed]);

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
      call.onEnd(() => onCallEnd());

      const callIntegrated: CallActive = {
        ...call,
        peer: call.peer,
        onEnd: (cb) => {
          call.onEnd(() => {
            onCallEnd();
            cb();
          });
        },
        onError: (cb) => {
          call.onError((error) => {
            onCallError(call.id, call.device_token, error);
            cb(error);
          });
        },
      };

      setScreen("call");
      setActive(callIntegrated);
      pictureInPicture.call = call;

      return callIntegrated;
    },
    [onCallEnd, setScreen, onCallError],
  );

  const onOffer = useCallback(
    (offer: CallOffer) => {
      if (active) return;

      function onOfferEnd() {
        setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
        stopRingtone(offers);

        setTimeout(() => {
          toast.dismiss(offer.id);
        }, 2000);
      }

      const offerIntegrated: CallOffer = {
        ...offer,
        onEnd(cb) {
          offer.onEnd(() => {
            onOfferEnd();
            cb();
          });
        },
        onAcceptedElsewhere(cb) {
          offer.onAcceptedElsewhere(() => {
            onOfferEnd();
            cb();
          });
        },
        onRejectedElsewhere(cb) {
          offer.onRejectedElsewhere(() => {
            onOfferEnd();
            cb();
          });
        },
        onUnanswered(cb) {
          offer.onUnanswered(() => {
            onOfferEnd();
            cb();
          });
        },
        async accept() {
          const { call, err } = await offer.accept();

          if (!call) return { call, err };

          setOffers([]);
          stopRingtone(offers);
          enablePiP();
          openWidget();
          widgetStatusCache = widgetIsClosed;

          return { call: onCallAccept(call), err };
        },
        async reject() {
          const { err } = await offer.reject();

          if (!err) stopRingtone(offers);

          return { err };
        },
      };

      setOffers((prev) => [...prev, offerIntegrated]);

      startRingtone();

      toast(<OfferNotification offer={offerIntegrated} />, {
        id: offer.id,
        duration: 100_000,
        className: "wv:max-w-[400px] wv:!w-full",
      });
    },
    [widgetIsClosed, active, onCallAccept, openWidget, offers],
  );

  const start = useCallback(
    async (to: string, config: { fromTokens?: string[]; displayName?: string } = {}) => {
      const { call, err } = await wavoip.startCall({
        fromTokens: config.fromTokens ?? devices.filter((device) => device.enable).map((device) => device.token),
        to,
      });

      if (err) {
        return { err };
      }

      if (config.displayName) {
        call.peer.displayName = config.displayName;
        call.peer.phone = config.displayName;
      }

      call.onPeerAccept((activeCall) => {
        onCallAccept(activeCall);
        setOutgoing(undefined);
      });

      call.onUnanswered(() => onCallEnd());

      call.onEnd(() => onCallEnd());

      const callOutgoinIntegrated: CallOutgoing = {
        ...call,
        peer: call.peer,
        onPeerAccept: (cb) => {
          call.onPeerAccept((activeCall) => {
            const callIntegrated = onCallAccept(activeCall);
            setOutgoing(undefined);
            cb(callIntegrated);
          });
        },
        onEnd: (cb) => {
          call.onEnd(() => {
            cb();
            onCallEnd();
          });
        },
        onUnanswered: (cb) => {
          call.onUnanswered(() => {
            cb();
            onCallEnd();
          });
        },
      };

      widgetStatusCache = widgetIsClosed;
      openWidget();
      setOutgoing(callOutgoinIntegrated);
      setScreen("outgoing");
      enableConfirmClose();
      enablePiP();
      pictureInPicture.call = callOutgoinIntegrated;

      return { err: null };
    },
    [devices, onCallAccept, onCallEnd, setScreen, wavoip.startCall, openWidget, widgetIsClosed],
  );

  wavoip.onOffer((offer) => onOffer(offer));

  return { offers, outgoing, active, start };
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

function stopRingtone(offers: CallOffer[]) {
  if (!offers.length) {
    ringtone_sound.pause();
    vibration_sound.pause();
  }
}

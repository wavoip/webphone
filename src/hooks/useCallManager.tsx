import type { CallActive, CallOffer, CallOutgoing, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { OfferNotification } from "@/components/OfferNotification";
import type { DeviceState } from "@/hooks/useDeviceManager";
import { disablePiP, enablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";

type Props = {
  wavoip: Wavoip;
  devices: DeviceState[];
};

const ringtone_sound = new Audio(Ringtone);
const vibration_sound = new Audio(Vibration);

export function useCallManager({ wavoip, devices }: Props) {
  const { setScreen } = useScreen();
  const { open: openWidget } = useWidget();

  const [offers, setOffers] = useState<CallOffer[]>([]);
  const [callOutgoing, setCallOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [callActive, setCallActive] = useState<CallActive | undefined>(undefined);

  const onCallEnd = useCallback(() => {
    disableConfirmClose();
    disablePiP();

    setTimeout(() => {
      setScreen("keyboard");
      setCallOutgoing(undefined);
      setCallActive(undefined);
      pictureInPicture.call = null;
    }, 3000);
  }, [setScreen]);

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
      };

      setScreen("call");
      setCallActive(callIntegrated);
      pictureInPicture.call = call;

      return callIntegrated;
    },
    [onCallEnd, setScreen],
  );

  const startRingtone = useCallback(() => {
    ringtone_sound.currentTime = 0;
    ringtone_sound.loop = true;
    ringtone_sound.volume = 0.25;
    ringtone_sound.play();

    vibration_sound.loop = true;
    vibration_sound.currentTime = 0;
    vibration_sound.volume = 0.25;
    vibration_sound.play();
  }, []);

  const stopRingtone = useCallback(() => {
    if (!offers.length) {
      ringtone_sound.pause();
      vibration_sound.pause();
    }
  }, [offers]);

  const onOffer = useCallback(
    (offer: CallOffer) => {
      if (callActive) return;

      function onOfferEnd() {
        setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
        stopRingtone();

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
          return offer.accept().then(({ call, err }) => {
            ringtone_sound.pause();
            vibration_sound.pause();

            if (!call) return { call, err };

            enableConfirmClose();
            enablePiP();
            setOffers([]);
            const callIntegrated = onCallAccept(call);
            openWidget();

            return { call: callIntegrated, err };
          });
        },
        async reject() {
          return offer.reject().then(({ err }) => {
            ringtone_sound.pause();
            vibration_sound.pause();

            enableConfirmClose();

            return { err };
          });
        },
      };

      setOffers((prev) => [...prev, offerIntegrated]);

      startRingtone();

      toast(<OfferNotification offer={offerIntegrated} />, {
        id: offer.id,
        duration: 100000,
        className: "wv:max-w-[400px] wv:!w-full",
      });
    },
    [callActive, onCallAccept, openWidget, startRingtone, stopRingtone],
  );

  const startCall = useCallback(
    async (to: string, fromTokens: string[] | null) => {
      const { call, err } = await wavoip.startCall({
        fromTokens: fromTokens ?? devices.filter((device) => device.enable).map((device) => device.token),
        to,
      });

      if (err) {
        return { err };
      }

      call.onPeerAccept((activeCall) => {
        onCallAccept(activeCall);
        setCallOutgoing(undefined);
      });

      call.onEnd(() => onCallEnd());

      const callOutgoinIntegrated: CallOutgoing = {
        ...call,
        peer: call.peer,
        onPeerAccept: (cb) => {
          call.onPeerAccept((activeCall) => {
            const callIntegrated = onCallAccept(activeCall);
            setCallOutgoing(undefined);
            cb(callIntegrated);
          });
        },
        onEnd: (cb) => {
          call.onEnd(() => {
            cb();
            onCallEnd();
          });
        },
      };

      setCallOutgoing(callOutgoinIntegrated);
      setScreen("outgoing");
      enableConfirmClose();
      enablePiP();
      pictureInPicture.call = callOutgoinIntegrated;

      return { err: null };
    },
    [devices, onCallAccept, onCallEnd, setScreen, wavoip.startCall],
  );

  wavoip.onOffer((offer) => onOffer(offer));

  return { offers, callOutgoing, callActive, startCall };
}

function enableConfirmClose() {
  window.addEventListener("beforeunload", handleBeforeUnload);
}

function disableConfirmClose() {
  window.removeEventListener("beforeunload", handleBeforeUnload);
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
}

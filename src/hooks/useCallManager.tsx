import type { CallActive, CallOffer, CallOutgoing, Wavoip } from "@wavoip/wavoip-api";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { OfferNotification } from "@/components/OfferNotification";
import type { DeviceState } from "@/hooks/useDeviceManager";
import { disablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { useScreen } from "@/providers/ScreenProvider";
import { useWidget } from "@/providers/WidgetProvider";

type Props = {
  wavoip: Wavoip;
  devices: DeviceState[];
};

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

  const onOffer = useCallback(
    (offer: CallOffer) => {
      if (callActive) return;

      function onOfferEnd() {
        setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
        toast.dismiss(offer.id);
      }

      offer.onEnd(() => onOfferEnd());

      const offerIntegrated: CallOffer = {
        ...offer,
        onEnd(cb) {
          offer.onEnd(() => {
            onOfferEnd();
            cb();
          });
        },
        async accept() {
          return offer.accept().then(({ call, err }) => {
            if (!call) return { call, err };

            enableConfirmClose();
            // enablePiP();
            setOffers([]);
            const callIntegrated = onCallAccept(call);

            return { call: callIntegrated, err };
          });
        },
      };

      setOffers((prev) => [...prev, offerIntegrated]);
      toast(<OfferNotification offer={offer} />, { id: offer.id });
      openWidget();
    },
    [callActive, onCallAccept, openWidget],
  );

  const startCall = useCallback(
    async (to: string) => {
      const { call, err } = await wavoip.startCall({
        fromTokens: devices.filter((device) => device.enable).map((device) => device.token),
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
      // enablePiP();
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

import React, { createContext, type ReactNode, useContext, useState } from "react";
import type { CallActive, CallOffer, CallOutgoing, Device, MultimediaError, Wavoip } from "wavoip-api";
import { usePhone } from "@/providers/ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  devices: Device[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  multimediaError?: MultimediaError;
  makeCall: (to: string) => Promise<void>;
  addDevice: (token: string) => void;
  removeDevice: (token: string) => void;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  wavoip: Wavoip;
  children: ReactNode;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ wavoip, children }) => {
  const { setScreen } = usePhone();

  const [wavoipInstance] = useState(wavoip);

  const [devices, setDevices] = useState<Device[]>(() => wavoipInstance.getDevices());

  const [offers, setOffers] = useState<CallOffer[]>([]);
  // const [offers, setOffers] = useState<CallOffer[]>([
  //   {
  //     id: "teste",
  //     accept: () => new Promise<CallActive | null>((resolve) => resolve(null)),
  //     reject: () => new Promise<{ err: string | null }>((resolve) => resolve({ err: null })),
  //     device_token: "token foda",
  //     muted: false,
  //     direction: "INCOMING",
  //     peer: "PUTA",
  //     peerMuted: false,
  //     status: "RINGING",
  //     onAcceptedElsewhere: () => {},
  //     onEnd: () => {},
  //     onRejectedElsewhere: () => {},
  //     onUnanswered: () => {},
  //   },
  // ]);
  const [callOutgoing, setCallOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [callActive, setCallActive] = useState<CallActive | undefined>(undefined);
  const [multimediaError, setMultimediaError] = useState<MultimediaError | undefined>(undefined);

  async function makeCall(to: string) {
    const { call, err } = await wavoipInstance.startCall({ to });

    if (err) {
      console.error("Erro ao iniciar chamada:", err.message);
      return;
    }

    call.onPeerAccept((activeCall) => {
      console.log("Chamada aceita pelo peer:", activeCall);
      setScreen("call");
      setCallActive(activeCall);
    });

    call.onEnd(() => {
      console.log("Chamada encerrada");
      setTimeout(() => {
        setScreen("keyboard");
        setCallOutgoing(undefined);
      }, 3000);
    });

    const callOutgoinIntegrated: CallOutgoing = {
      ...call,
      onPeerAccept: (cb) => {
        call.onPeerAccept((activeCall) => {
          console.log("Chamada aceita pelo peer:", activeCall);
          cb(activeCall);
          setScreen("call");
          setCallActive(activeCall);
        });
      },
      onEnd: (cb) => {
        call.onEnd(() => {
          console.log("Chamada encerrada");
          cb();
          setTimeout(() => {
            setScreen("keyboard");
            setCallOutgoing(undefined);
          }, 3000);
        });
      },
    };

    setCallOutgoing(callOutgoinIntegrated);
    setScreen("outgoing");
  }

  function addDevice(token: string) {
    setDevices(wavoipInstance.addDevices([token]));
  }

  function removeDevice(token: string) {
    setDevices(wavoipInstance.removeDevices([token]));
  }

  wavoipInstance.onOffer((offer) => {
    console.log("Nova oferta de chamada recebida:", offer);

    if (callActive) {
      return;
    }

    offer.onEnd(() => {
      setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
    });

    const offerIntegrated: CallOffer = {
      ...offer,
      onEnd: (cb) => {
        offer.onEnd(() => {
          cb();
          setOffers((prev) => prev.filter(({ id }) => id !== offer.id));
        });
      },
      accept: () =>
        offer.accept().then((call) => {
          if (!call) {
            return call;
          }

          call.onEnd(() => {
            setTimeout(() => {
              setCallActive(undefined);
              setScreen("keyboard");
            });
          });

          const callIntegrated: CallActive = {
            ...call,
            onEnd: (cb) => {
              call.onEnd(() => {
                cb();
                setTimeout(() => {
                  setCallActive(undefined);
                  setScreen("keyboard");
                });
              });
            },
          };

          setCallActive(callIntegrated);
          setScreen("call");
          setOffers([]);

          return callIntegrated;
        }),
    };

    setOffers((prev) => [...prev, offerIntegrated]);
  });

  wavoipInstance.onMultimediaError((err) => setMultimediaError(err));

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
        devices,
        offers,
        callOutgoing,
        callActive,
        multimediaError,
        makeCall,
        addDevice,
        removeDevice,
      }}
    >
      {children}
    </WavoipContext.Provider>
  );
};

export const useWavoip = () => {
  const context = useContext(WavoipContext);
  if (!context) {
    throw new Error("useWavoip deve ser usado dentro de WavoipProvider");
  }
  return context;
};

<<<<<<< Updated upstream
import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import type { CallActive, CallOffer, CallOutgoing, MultimediaError } from "wavoip-api";
import { Wavoip } from "wavoip-api";
import { usePhone } from "./ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  offers?: CallOffer[];
  callouts?: CallOutgoing[];
  callactives?: CallActive[];
  multimediaError?: MultimediaError;
  makeCall?: (to: string) => Promise<void>;
  callingTo?: string | null;
  callingMe?: string | null;
  setCallingMe?: React.Dispatch<React.SetStateAction<string | null>>;
  callIndex: number;
  setCallIndex: React.Dispatch<React.SetStateAction<number>>;
  setCallActives: React.Dispatch<React.SetStateAction<CallActive[]>>;
=======
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
>>>>>>> Stashed changes
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
<<<<<<< Updated upstream
  children: ReactNode;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children }) => {
  const { setScreen } = usePhone();
  const token = ["d4a8d1c1-18f9-4ff5-8712-edfffa71a2a2"];
  const [wavoipInstance] = useState(() => new Wavoip({ tokens: token }));
  const [callingTo, setCallingTo] = useState<string | null>(null);
  const [callingMe, setCallingMe] = useState<string | null>(null);
  const [callOffers, setCallOffers] = useState<CallOffer[]>([]);
  const [callOutgoings, setCallOutgoings] = useState<CallOutgoing[]>([]);
  const [callActives, setCallActives] = useState<CallActive[]>([]);
  const [callIndex, setCallIndex] = useState(0);
=======
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
>>>>>>> Stashed changes

  const setupCallOutgoing = useCallback(
    (call: CallOutgoing) => {
      if (!call) return;
      call.onPeerAccept((activeCall) => {
        console.log("Chamada aceita pelo peer:", activeCall);
        setScreen("call");
        setCallingTo(activeCall.peer);
        setCallActives((prev) => [...prev, activeCall]);
      });

<<<<<<< Updated upstream
      call.onPeerReject(() => {
        console.log("Chamada rejeitada pelo peer");
        setScreen("keyboard");
      });

      call.onUnanswered(() => {
        console.log("Chamada não atendida");
        setScreen("keyboard");
      });

      call.onEnd(() => {
        console.log("Chamada encerrada");
        setScreen("keyboard");
      });
    },
    [setScreen],
  );

  useEffect(() => {
    setupCallOutgoing(callOutgoings[callIndex]);
    console.log("CallOutgoing configurada");
  }, [callOutgoings, callIndex, setupCallOutgoing]);

  async function makeCall(to: string) {
    const result = await wavoipInstance.startCall({ fromTokens: token, to });

    if (result.err) {
      console.error("Erro ao iniciar chamada:", result.err.message);
      return;
    }
    setScreen("outgoing");
    callOutgoings.push(result.call);
  }

  useEffect(() => {
    wavoipInstance.onOffer((offer) => {
      console.log("Nova oferta de chamada recebida:", offer);
      setScreen("incoming");
      setCallingMe?.(offer.peer || null);
      callOffers.push(offer);
    });
  }, [wavoipInstance, setScreen, callOffers]);
=======
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
>>>>>>> Stashed changes

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
<<<<<<< Updated upstream
        offers: callOffers,
        callouts: callOutgoings,
        callactives: callActives,
        multimediaError: undefined,
        makeCall,
        callingTo,
        callingMe,
        setCallingMe,
        callIndex,
        setCallIndex,
        setCallActives,
=======
        devices,
        offers,
        callOutgoing,
        callActive,
        multimediaError,
        makeCall,
        addDevice,
        removeDevice,
>>>>>>> Stashed changes
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

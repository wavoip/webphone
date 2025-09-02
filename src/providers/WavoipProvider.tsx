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
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
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

  const setupCallOutgoing = useCallback(
    (call: CallOutgoing) => {
      if (!call) return;
      call.onPeerAccept((activeCall) => {
        console.log("Chamada aceita pelo peer:", activeCall);
        setScreen("call");
        setCallingTo(activeCall.peer);
        setCallActives((prev) => [...prev, activeCall]);
      });

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

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
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

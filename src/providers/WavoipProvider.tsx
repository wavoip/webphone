import React, { createContext, type ReactNode, useContext, useState } from "react";
import type { CallActive, CallOffer, CallOutgoing, MultimediaError, Wavoip } from "wavoip-api";
import { usePhone } from "@/providers/ScreenProvider";

interface WavoipContextProps {
  wavoipInstance: Wavoip;
  offers?: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  multimediaError?: MultimediaError;
  makeCall?: (to: string) => Promise<void>;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  wavoipInstance: Wavoip;
  children: ReactNode;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ wavoipInstance, children }) => {
  const { setScreen } = usePhone();
  const [callOffers, setCallOffers] = useState<CallOffer[]>([]);
  const [callOutgoing, setCallOutgoing] = useState<CallOutgoing | undefined>(undefined);
  const [callActive, setCallActive] = useState<CallActive | undefined>(undefined);
  const [multimediaError, setMultimediaError] = useState<MultimediaError | undefined>(undefined);

  function setupCallOutgoing(call: CallOutgoing) {
    call.onPeerAccept((activeCall) => {
      console.log("Chamada aceita pelo peer:", activeCall);
      setScreen("call");
      setCallActive(activeCall);
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
  }

  async function makeCall(to: string) {
    const result = await wavoipInstance.startCall({ fromTokens: tokens, to });

    if (result.err) {
      console.error("Erro ao iniciar chamada:", result.err.message);
      return;
    }
    setupCallOutgoing(result.call);
    setCallOutgoing(result.call);
    setScreen("outgoing");
  }

  wavoipInstance.onOffer((offer) => {
    console.log("Nova oferta de chamada recebida:", offer);
    offer.onEnd(() => {
      setCallOffers((prev) => prev.filter((o) => o.id !== offer.id));
    });

    setScreen("incoming");
    setCallOffers((prev) => [...prev, offer]);
  });

  wavoipInstance.onMultimediaError((err) => setMultimediaError(err));

  return (
    <WavoipContext.Provider
      value={{
        wavoipInstance,
        offers: callOffers,
        callOutgoing,
        callActive,
        multimediaError,
        makeCall,
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

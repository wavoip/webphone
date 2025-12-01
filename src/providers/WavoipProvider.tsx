import type { CallActive, CallOffer, CallOutgoing, Device, MultimediaError, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useCallManager } from "@/hooks/useCallManager";
import { useDeviceManager } from "@/hooks/useDeviceManager";
import { buildAPI } from "@/lib/webphone-api";

interface WavoipContextProps {
  wavoip: Wavoip;
  devices: (Device & { enable: boolean })[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  multimediaError?: MultimediaError;
  addDevice: (token: string) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
  startCall: (
    to: string,
    fromTokens: string[],
  ) => Promise<{
    err: {
      message: string;
      devices: {
        token: string;
        reason: string;
      }[];
    } | null;
  }>;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  children: ReactNode;
  wavoip: Wavoip;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children, wavoip }) => {
  const { devices, addDevice, removeDevice, disableDevice, enableDevice } = useDeviceManager({
    wavoip: wavoip,
  });

  const { offers, callOutgoing, callActive, startCall } = useCallManager({ wavoip, devices });

  const [multimediaError, setMultimediaError] = useState<MultimediaError | undefined>(undefined);

  wavoip.onMultimediaError((err) => {
    setMultimediaError(err);
  });

  useEffect(() => {
    // Caso tenha call ativa, dá um aviso prévio caso o usuário tente navegar ou fechar essa página
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (callActive) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callActive]);

  useEffect(() => {
    return () => {
      delete window.wavoip;
    };
  }, []);

  buildAPI({
    call: {
      startCall: startCall,
      getCallActive: () => callActive,
      getCallOutgoing: () => callOutgoing,
      getOffers: () => offers,
    },
    device: {
      getDevices: wavoip.getDevices,
      addDevice: addDevice,
      removeDevice: removeDevice,
      enableDevice: enableDevice,
      disableDevice: disableDevice,
    },
  });

  return (
    <WavoipContext.Provider
      value={{
        wavoip,
        devices,
        offers,
        callOutgoing,
        callActive,
        multimediaError,
        startCall,
        addDevice,
        removeDevice,
        enableDevice,
        disableDevice,
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

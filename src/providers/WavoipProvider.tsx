import type { CallActive, CallOffer, CallOutgoing, Device, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect } from "react";
import { useCallManager } from "@/hooks/useCallManager";
import { useDeviceManager } from "@/hooks/useDeviceManager";
import { buildAPI } from "@/lib/webphone-api";

interface WavoipContextProps {
  wavoip: Wavoip;
  devices: (Device & { enable: boolean })[];
  offers: CallOffer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
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
  const {
    devices,
    add: addDevice,
    remove: removeDevice,
    disable: disableDevice,
    enable: enableDevice,
  } = useDeviceManager({ wavoip: wavoip });

  const { offers, outgoing: callOutgoing, active: callActive, start: startCall } = useCallManager({ wavoip, devices });

  useEffect(() => {
    return () => {
      delete window.wavoip;
    };
  }, []);

  buildAPI({
    call: {
      startCall: startCall,
      getCallActive: () => {
        if (!callActive) return undefined;
        const { id, type, status, device_token, direction, peer, muted } = callActive;
        return { id, type, status, device_token, direction, peer, muted };
      },
      getCallOutgoing: () => {
        if (!callOutgoing) return undefined;
        const { id, type, status, device_token, direction, peer, muted } = callOutgoing;
        return { id, type, status, device_token, direction, peer, muted };
      },
      getOffers: () => {
        return offers.map(({ id, type, status, device_token, direction, peer, muted }) => ({
          id,
          type,
          status,
          device_token,
          direction,
          peer,
          muted,
        }));
      },
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

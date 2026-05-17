import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type CallStatus, useCallManager } from "@/hooks/useCallManager";
import { mergeToAPI } from "@/lib/webphone-api/api";
import { bus } from "@/lib/webphone-api/bus";
import { useBusState } from "@/lib/webphone-api/hooks/useBusState";
import type { CallActive, CallOutgoing, DeviceState, Offer, Wavoip } from "@/lib/webphone-api/sdk-types";
import type { CallOfferProps } from "@/lib/webphone-api/WebphoneAPI";

interface WavoipContextProps {
  wavoip: Wavoip;
  devices: DeviceState[];
  offers: Offer[];
  callOutgoing?: CallOutgoing;
  callActive?: CallActive;
  callStatus: CallStatus;
  peerMuted: boolean;
  addDevice: (token: string, persist?: boolean) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
  startCall: ReturnType<typeof useCallManager>["start"];
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  children: ReactNode;
  wavoip: Wavoip;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children, wavoip }) => {
  const devices = useBusState("device.list", "device.list.changed");

  const addDevice = (token: string, persist?: boolean) => {
    void bus.request("device.add", { token, persist });
  };
  const removeDevice = (token: string) => {
    void bus.request("device.remove", { token });
  };
  const enableDevice = (token: string) => {
    void bus.request("device.enable", { token });
  };
  const disableDevice = (token: string) => {
    void bus.request("device.disable", { token });
  };

  const [onOffer, setOnOffer] = useState<(offer: CallOfferProps) => void>(() => () => {});

  const {
    offers,
    outgoing: callOutgoing,
    active: callActive,
    start: startCall,
    callStatus,
    peerMuted,
  } = useCallManager({ wavoip, devices, onOffer });

  useEffect(() => {
    return () => {
      delete window.wavoip;
    };
  }, []);

  useEffect(() => {
    mergeToAPI({
      call: {
        start: (...args) => startCall(...args),
        startCall: (to, fromTokens) => startCall(to, fromTokens ? { fromTokens } : {}), // Deprecated
        getCallActive: () => {
          if (!callActive) return undefined;
          const { id, type, status, device_token, direction, peer } = callActive;
          return { id, type, status, device_token, direction, peer };
        },
        getCallOutgoing: () => {
          if (!callOutgoing) return undefined;
          const { id, type, status, device_token, direction, peer } = callOutgoing;
          return { id, type, status, device_token, direction, peer };
        },
        getOffers: () => {
          return offers.map(({ id, type, status, device_token, direction, peer }) => ({
            id,
            type,
            status,
            device_token,
            direction,
            peer,
          }));
        },
        onOffer: (cb) => {
          setOnOffer(() => cb);
        },
      },
    });
  }, [startCall, offers, callOutgoing, callActive]);

  return (
    <WavoipContext.Provider
      value={{
        wavoip,
        devices,
        offers,
        callOutgoing,
        callActive,
        callStatus,
        peerMuted,
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

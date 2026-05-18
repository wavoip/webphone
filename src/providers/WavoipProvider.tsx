import React, { createContext, type ReactNode, useContext, useEffect } from "react";
import { bus } from "@/lib/webphone-api/bus";
import type { CallStatus } from "@/lib/webphone-api/events";
import { useBusState } from "@/lib/webphone-api/hooks/useBusState";
import type { CallActive, CallOutgoing, DeviceState, Offer, Wavoip } from "@/lib/webphone-api/sdk-types";

type StartCallResult =
  | { call: null; err: { message: string; devices: { token: string; reason: string }[] } }
  | { call: { id: string; peer: CallActive["peer"] }; err: null };

type StartCall = (to: string, config?: { fromTokens?: string[]; displayName?: string }) => Promise<StartCallResult>;

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
  startCall: StartCall;
}

const WavoipContext = createContext<WavoipContextProps | undefined>(undefined);

interface WavoipProviderProps {
  children: ReactNode;
  wavoip: Wavoip;
}

export const WavoipProvider: React.FC<WavoipProviderProps> = ({ children, wavoip }) => {
  const devices = useBusState("device.list", "device.list.changed");
  const offers = useBusState("call.offers", "offer.list.changed");
  const callOutgoing = useBusState("call.outgoing", "call.outgoing.changed");
  const callActive = useBusState("call.active", "call.active.changed");
  const callStatus = useBusState("call.status", "call.status.changed");
  const peerMuted = useBusState("call.peerMuted", "call.peer.muted.changed");

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

  const startCall: StartCall = (to, config = {}) =>
    bus.request("call.start", { to, fromTokens: config.fromTokens, displayName: config.displayName });

  useEffect(() => {
    return () => {
      delete window.wavoip;
    };
  }, []);

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

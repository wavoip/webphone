import type { CallActive, CallOutgoing, Device, Offer, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { type CallStatus, useCallManager } from "@/hooks/useCallManager";
import { useDeviceManager } from "@/hooks/useDeviceManager";
import { mergeToAPI, warnDeprecated } from "@/lib/webphone-api/api";
import type { CallOfferProps } from "@/lib/webphone-api/WebphoneAPI";

interface WavoipContextProps {
  wavoip: Wavoip;
  devices: (Device & { enable: boolean })[];
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
  const {
    devices,
    add: addDevice,
    remove: removeDevice,
    disable: disableDevice,
    enable: enableDevice,
  } = useDeviceManager({ wavoip: wavoip });

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
        // @deprecated Kept for backward compatibility. Prefer `call.start(to, { fromTokens })`.
        startCall: (to, fromTokens) => {
          warnDeprecated("call.startCall", "call.start(to, { fromTokens })");
          return startCall(to, fromTokens ? { fromTokens } : {});
        },
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
      device: {
        get: () => devices,
        add: (...args) => addDevice(...args),
        remove: (...args) => removeDevice(...args),
        enable: (...args) => enableDevice(...args),
        disable: (...args) => disableDevice(...args),
        // @deprecated Prefer `device.get`.
        getDevices: () => {
          warnDeprecated("device.getDevices", "device.get");
          return devices;
        },
        // @deprecated Prefer `device.add`.
        addDevice: (...args) => {
          warnDeprecated("device.addDevice", "device.add");
          return addDevice(...args);
        },
        // @deprecated Prefer `device.remove`.
        removeDevice: (...args) => {
          warnDeprecated("device.removeDevice", "device.remove");
          return removeDevice(...args);
        },
        // @deprecated Prefer `device.enable`.
        enableDevice: (...args) => {
          warnDeprecated("device.enableDevice", "device.enable");
          return enableDevice(...args);
        },
        // @deprecated Prefer `device.disable`.
        disableDevice: (...args) => {
          warnDeprecated("device.disableDevice", "device.disable");
          return disableDevice(...args);
        },
      },
    });
  }, [devices, disableDevice, enableDevice, removeDevice, addDevice, startCall, offers, callOutgoing, callActive]);

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

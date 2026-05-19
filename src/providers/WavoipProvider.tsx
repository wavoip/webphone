import type { CallActive, CallOutgoing, Offer } from "@wavoip/wavoip-api";
import { Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Ringtone from "@/assets/sounds/ringtone-02.mp3";
import Vibration from "@/assets/sounds/vibration.mp3";
import { OfferNotification } from "@/components/OfferNotification";
import { getSettings } from "@/lib/device-settings";
import { mergeToAPI, warnDeprecated } from "@/lib/webphone-api/api";
import type { CallOfferProps } from "@/lib/webphone-api/WebphoneAPI";
import { Middleware } from "@/middleware/Middleware";
import { audioRingtonePlayer } from "@/middleware/effects/ringtone";
import {
  MiddlewareProvider,
  useCallState,
  useDevices,
  useMiddleware,
  useOffers,
} from "@/middleware/react/hooks";
import type { CallStatus } from "@/middleware/store/slices/callSlice";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
import { disablePiP, pictureInPicture } from "@/lib/picture-in-picture";
import { useScreen } from "@/providers/ScreenProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWidget } from "@/providers/WidgetProvider";

type StartCall = Middleware["controllers"]["call"]["start"];

interface WavoipContextProps {
  wavoip: Wavoip;
  devices: DeviceStateEntry[];
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

type RootProps = { children: ReactNode };

export const WavoipProvider: React.FC<RootProps> = ({ children }) => {
  const settings = useSettings();

  const [middleware] = useState(() => {
    const wavoip = new Wavoip({ tokens: [...getSettings().keys()], platform: settings.platform });
    return new Middleware({
      wavoip,
      ringtone: audioRingtonePlayer(new Audio(Ringtone)),
      vibration: audioRingtonePlayer(new Audio(Vibration)),
    }).init();
  });

  useEffect(() => {
    return () => {
      middleware.destroy();
      pictureInPicture.call = null;
      disablePiP();
    };
  }, [middleware]);

  return (
    <MiddlewareProvider middleware={middleware}>
      <WavoipBridge>{children}</WavoipBridge>
    </MiddlewareProvider>
  );
};

function WavoipBridge({ children }: { children: ReactNode }) {
  const middleware = useMiddleware();
  const devices = useDevices();
  const offers = useOffers();
  const { outgoing, active, callStatus, peerMuted } = useCallState();
  const { setScreen } = useScreen();
  const { isClosed, setIsClosed, open: openWidget } = useWidget();
  const { callSettings } = useSettings();

  const startCall: StartCall = useMemo(
    () => (to, config) => middleware.controllers.call.start(to, config),
    [middleware],
  );

  const addDevice = useMemo(
    () => (token: string, persist?: boolean) => middleware.controllers.device.add(token, persist),
    [middleware],
  );
  const removeDevice = useMemo(() => (token: string) => middleware.controllers.device.remove(token), [middleware]);
  const enableDevice = useMemo(() => (token: string) => middleware.controllers.device.enable(token), [middleware]);
  const disableDevice = useMemo(() => (token: string) => middleware.controllers.device.disable(token), [middleware]);

  // Register a one-time displayName offer middleware when configured.
  // Limitation: there is no unregister yet (Stage 9 deals with this), so we
  // guard against double-registration with a module-scoped flag per middleware.
  useDisplayNameOfferMiddleware(middleware, callSettings.displayName);

  useScreenSync(middleware, setScreen);
  useToastBridge(middleware);
  useWidgetCache(middleware, isClosed, setIsClosed, openWidget);
  usePictureInPictureSync(middleware);

  // Compat: keep the legacy public API surface populated until Stage 7.
  useLegacyApiBridge({ middleware, startCall, devices, offers, outgoing, active });

  useEffect(() => {
    window.wavoip = window.wavoip;
    return () => {
      delete window.wavoip;
    };
  }, []);

  return (
    <WavoipContext.Provider
      value={{
        wavoip: middleware.wavoip,
        devices,
        offers,
        callOutgoing: outgoing,
        callActive: active,
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
}

export const useWavoip = () => {
  const context = useContext(WavoipContext);
  if (!context) {
    throw new Error("useWavoip deve ser usado dentro de WavoipProvider");
  }
  return context;
};

const displayNameRegistered = new WeakSet<Middleware>();

function useDisplayNameOfferMiddleware(middleware: Middleware, displayName?: string) {
  useEffect(() => {
    if (!displayName) return;
    if (displayNameRegistered.has(middleware)) return;
    displayNameRegistered.add(middleware);
    middleware.registry.use("offer", (offer, next) => {
      offer.peer.displayName = displayName;
      offer.peer.phone = displayName;
      next();
    });
  }, [middleware, displayName]);

  // Outgoing call: mutate the live CallOutgoing peer once it lands in the store.
  useEffect(() => {
    if (!displayName) return;
    return middleware.store.subscribe(
      (s) => s.outgoing,
      (outgoing) => {
        if (!outgoing) return;
        outgoing.peer.displayName = displayName;
        outgoing.peer.phone = displayName;
      },
    );
  }, [middleware, displayName]);
}

function useScreenSync(middleware: Middleware, setScreen: (s: "call" | "outgoing" | "keyboard") => void) {
  useEffect(() => {
    return middleware.store.subscribe(
      (s) => ({ active: s.active, outgoing: s.outgoing, status: s.callStatus }),
      ({ active, outgoing, status }) => {
        if (active) setScreen("call");
        else if (outgoing) setScreen("outgoing");
        else if (status === "idle") setScreen("keyboard");
      },
    );
  }, [middleware, setScreen]);
}

function useToastBridge(middleware: Middleware) {
  useEffect(() => {
    return middleware.store.subscribe(
      (s) => s.offers,
      (current, previous) => {
        for (const offer of current) {
          if (previous.some((p) => p.id === offer.id)) continue;
          toast(<OfferNotification offer={offer} />, {
            id: offer.id,
            duration: 100_000,
            className: "wv:max-w-[400px] wv:!w-full",
          });
        }
        for (const offer of previous) {
          if (current.some((c) => c.id === offer.id)) continue;
          setTimeout(() => toast.dismiss(offer.id), 2000);
        }
      },
    );
  }, [middleware]);
}

function useWidgetCache(
  middleware: Middleware,
  isClosed: boolean,
  setIsClosed: React.Dispatch<React.SetStateAction<boolean>>,
  openWidget: () => void,
) {
  const closedCache = React.useRef<boolean | null>(null);

  useEffect(() => {
    return middleware.store.subscribe(
      (s) => Boolean(s.active || s.outgoing),
      (inCall) => {
        if (inCall) {
          if (closedCache.current === null) closedCache.current = isClosed;
          openWidget();
        } else if (closedCache.current !== null) {
          if (closedCache.current) setIsClosed(true);
          closedCache.current = null;
        }
      },
    );
  }, [middleware, isClosed, setIsClosed, openWidget]);
}

function usePictureInPictureSync(middleware: Middleware) {
  useEffect(() => {
    return middleware.store.subscribe(
      (s) => s.active ?? s.outgoing,
      (call) => {
        pictureInPicture.call = call ?? null;
      },
    );
  }, [middleware]);
}

function useLegacyApiBridge({
  middleware,
  startCall,
  devices,
  offers,
  outgoing,
  active,
}: {
  middleware: Middleware;
  startCall: StartCall;
  devices: DeviceStateEntry[];
  offers: Offer[];
  outgoing?: CallOutgoing;
  active?: CallActive;
}) {
  useEffect(() => {
    mergeToAPI({
      call: {
        start: (...args) => startCall(...args),
        startCall: (to, fromTokens) => {
          warnDeprecated("call.startCall", "call.start(to, { fromTokens })");
          return startCall(to, fromTokens ? { fromTokens } : {});
        },
        getCallActive: () => projectCall(active),
        getCallOutgoing: () => projectCall(outgoing),
        getOffers: () => offers.map(projectCallProps),
        onOffer: (cb: (offer: CallOfferProps) => void) => {
          middleware.registry.use("offer", (offer, next) => {
            cb(projectCallProps(offer));
            next();
          });
        },
      },
      device: {
        get: () => devices,
        add: (token, persist) => middleware.controllers.device.add(token, persist),
        remove: (token) => middleware.controllers.device.remove(token),
        enable: (token) => middleware.controllers.device.enable(token),
        disable: (token) => middleware.controllers.device.disable(token),
        getDevices: () => {
          warnDeprecated("device.getDevices", "device.get");
          return devices;
        },
        addDevice: (token, persist) => {
          warnDeprecated("device.addDevice", "device.add");
          return middleware.controllers.device.add(token, persist);
        },
        removeDevice: (token) => {
          warnDeprecated("device.removeDevice", "device.remove");
          return middleware.controllers.device.remove(token);
        },
        enableDevice: (token) => {
          warnDeprecated("device.enableDevice", "device.enable");
          return middleware.controllers.device.enable(token);
        },
        disableDevice: (token) => {
          warnDeprecated("device.disableDevice", "device.disable");
          return middleware.controllers.device.disable(token);
        },
      },
    });
  }, [middleware, startCall, devices, offers, outgoing, active]);
}

function projectCall<T extends { id: string; type: string; status: string; device_token: string; direction: string; peer: { phone: string; displayName: string | null; profilePicture: string | null; muted: boolean } }>(
  call: T | undefined,
) {
  if (!call) return undefined;
  return projectCallProps(call);
}

function projectCallProps<T extends { id: string; type: string; status: string; device_token: string; direction: string; peer: { phone: string; displayName: string | null; profilePicture: string | null; muted: boolean } }>(
  call: T,
) {
  const { id, type, status, device_token, direction, peer } = call;
  return { id, type, status, device_token, direction, peer } as CallOfferProps;
}

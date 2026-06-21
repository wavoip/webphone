import type { CallActive, CallOutgoing, Offer, Wavoip } from "@wavoip/wavoip-api";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { OfferNotification } from "@/components/OfferNotification";
import type { Middleware } from "@/middleware/Middleware";
import { useCallState, useDevices, useMiddleware, useOffers } from "@/middleware/react/hooks";
import type { CallStatus } from "@/middleware/store/slices/callSlice";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
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
  return <WavoipBridge>{children}</WavoipBridge>;
};

function WavoipBridge({ children }: { children: ReactNode }) {
  const middleware = useMiddleware();
  const devices = useDevices();
  const offers = useOffers();
  const { outgoing, active, callStatus, peerMuted } = useCallState();
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

  useToastBridge(middleware);
  useWidgetCache(middleware, isClosed, setIsClosed, openWidget);
  usePictureInPictureSync(middleware);

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
  setIsClosed: (closed: boolean) => void,
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
      () => {},
    );
  }, [middleware]);
}

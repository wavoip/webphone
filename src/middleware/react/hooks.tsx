import { createContext, type ReactNode, useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Middleware } from "@/middleware/Middleware";
import type { MiddlewareStore } from "@/middleware/store/types";

const MiddlewareContext = createContext<Middleware | undefined>(undefined);

type ProviderProps = {
  middleware: Middleware;
  children: ReactNode;
};

export function MiddlewareProvider({ middleware, children }: ProviderProps) {
  return <MiddlewareContext.Provider value={middleware}>{children}</MiddlewareContext.Provider>;
}

export function useMiddleware(): Middleware {
  const mw = useContext(MiddlewareContext);
  if (!mw) throw new Error("useMiddleware must be used inside MiddlewareProvider");
  return mw;
}

function useMiddlewareSelector<T>(selector: (state: MiddlewareStore) => T): T {
  const mw = useMiddleware();
  return useStore(mw.store, selector);
}

function useMiddlewareShallow<T>(selector: (state: MiddlewareStore) => T): T {
  const mw = useMiddleware();
  return useStore(mw.store, useShallow(selector));
}

export function useCallState() {
  return useMiddlewareShallow((s) => ({
    callStatus: s.callStatus,
    outgoing: s.outgoing,
    active: s.active,
    activeStartedAt: s.activeStartedAt,
    peerMuted: s.peerMuted,
    callFailReason: s.callFailReason,
  }));
}

export function useDialState() {
  const middleware = useMiddleware();
  const { dialStatus, dialError, dialIsLoading } = useMiddlewareShallow((s) => ({
    dialStatus: s.dialStatus,
    dialError: s.dialError,
    dialIsLoading: s.dialIsLoading,
  }));

  return {
    status: dialStatus,
    error: dialError,
    isLoading: dialIsLoading,
    setStatus: middleware.store.getState().setDialStatus,
    setError: middleware.store.getState().setDialError,
    setIsLoading: middleware.store.getState().setDialIsLoading,
  };
}

export function useOffers() {
  return useMiddlewareSelector((s) => s.offers);
}

export function useDevices() {
  return useMiddlewareSelector((s) => s.devices);
}

export function useNotifications() {
  return useMiddlewareSelector((s) => s.notifications);
}

export function useWidgetState() {
  return useMiddlewareShallow((s) => ({
    isClosed: s.isClosed,
    position: s.position,
    buttonPosition: s.buttonPosition,
  }));
}

export function useUiState() {
  return useMiddlewareShallow((s) => ({
    screen: s.screen,
    theme: s.theme,
    settings: s.settings,
  }));
}

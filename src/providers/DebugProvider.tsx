import type {
  CallActive,
  CallOutgoing,
  ConnectivityIssue,
  IceDiagnostics,
  Offer,
  Unsubscribe,
} from "@wavoip/wavoip-api";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useMiddleware } from "@/middleware/react/hooks";

type CallLike = {
  on(event: "iceDiagnostics", cb: (diag: IceDiagnostics) => void): Unsubscribe;
  on(event: "connectivityIssue", cb: (issue: ConnectivityIssue) => void): Unsubscribe;
};

function asCallLike(call: Offer | CallOutgoing | CallActive): CallLike {
  return call as unknown as CallLike;
}

const MAX_ISSUE_HISTORY = 20;

export type IssueRecord = {
  at: number;
  issue: ConnectivityIssue;
};

type DebugInfo = {
  lastIceDiagnostics: IceDiagnostics | null;
  recentIssues: IssueRecord[];
};

const DebugContext = createContext<DebugInfo | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const middleware = useMiddleware();
  const [lastIceDiagnostics, setLastIceDiagnostics] = useState<IceDiagnostics | null>(null);
  const [recentIssues, setRecentIssues] = useState<IssueRecord[]>([]);

  const pushIssue = useCallback((issue: ConnectivityIssue) => {
    setRecentIssues((prev) => {
      const next = [...prev, { at: Date.now(), issue }];
      return next.slice(Math.max(0, next.length - MAX_ISSUE_HISTORY));
    });
  }, []);

  useEffect(() => {
    const wireCall = (call: Offer | CallOutgoing | CallActive | undefined): (() => void) => {
      if (!call) return () => {};
      const c = asCallLike(call);
      const unsubDiag = c.on("iceDiagnostics", (diag) => setLastIceDiagnostics(diag));
      const unsubIssue = c.on("connectivityIssue", (issue) => pushIssue(issue));
      return () => {
        unsubDiag?.();
        unsubIssue?.();
      };
    };

    let activeOffers = new Map<string, () => void>();
    let unsubActive: (() => void) | undefined;
    let unsubOutgoing: (() => void) | undefined;

    const unsubOffers = middleware.store.subscribe(
      (s) => s.offers,
      (offers) => {
        const stillSeen = new Set<string>();
        for (const offer of offers) {
          stillSeen.add(offer.id);
          if (!activeOffers.has(offer.id)) activeOffers.set(offer.id, wireCall(offer));
        }
        for (const [id, cleanup] of activeOffers) {
          if (!stillSeen.has(id)) {
            cleanup();
            activeOffers.delete(id);
          }
        }
      },
    );

    const unsubActiveSel = middleware.store.subscribe(
      (s) => s.active,
      (active) => {
        unsubActive?.();
        unsubActive = wireCall(active);
      },
    );

    const unsubOutgoingSel = middleware.store.subscribe(
      (s) => s.outgoing,
      (outgoing) => {
        unsubOutgoing?.();
        unsubOutgoing = wireCall(outgoing);
      },
    );

    return () => {
      unsubOffers();
      unsubActiveSel();
      unsubOutgoingSel();
      unsubActive?.();
      unsubOutgoing?.();
      for (const cleanup of activeOffers.values()) cleanup();
      activeOffers = new Map();
    };
  }, [middleware, pushIssue]);

  return <DebugContext.Provider value={{ lastIceDiagnostics, recentIssues }}>{children}</DebugContext.Provider>;
}

export function useDebugInfo(): DebugInfo {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error("useDebugInfo must be used inside DebugProvider");
  return ctx;
}

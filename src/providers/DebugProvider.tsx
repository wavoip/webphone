import type {
  ActiveCall,
  ConnectivityIssue,
  IceDiagnostics,
  IncomingCall,
  OutgoingCall,
  Unsubscribe,
} from "@wavoip/wavoip-api/web";
import { createContext, createSignal, type JSX, onCleanup, useContext } from "solid-js";
import { useMiddleware } from "@/middleware/solid/context";

type CallLike = {
  id: string;
  on(event: "iceDiagnostics", cb: (diag: IceDiagnostics) => void): Unsubscribe;
  on(event: "connectivityIssue", cb: (issue: ConnectivityIssue) => void): Unsubscribe;
};

function asCallLike(call: IncomingCall | OutgoingCall | ActiveCall): CallLike {
  return call as unknown as CallLike;
}

const MAX_HISTORY = 20;

export type IssueRecord = {
  at: number;
  callId: string;
  issue: ConnectivityIssue;
};

export type IceRecord = {
  at: number;
  callId: string;
  diag: IceDiagnostics;
};

type DebugInfo = {
  readonly recentIssues: IssueRecord[];
  readonly recentIceDiagnostics: IceRecord[];
};

const DebugContext = createContext<DebugInfo>();

export function DebugProvider(props: { children: JSX.Element }) {
  const middleware = useMiddleware();
  const [recentIssues, setRecentIssues] = createSignal<IssueRecord[]>([]);
  const [recentIceDiagnostics, setRecentIce] = createSignal<IceRecord[]>([]);

  const ultimos = <T,>(lista: T[], novo: T) => lista.concat(novo).slice(-MAX_HISTORY);
  const pushIssue = (callId: string, issue: ConnectivityIssue) =>
    setRecentIssues((prev) => ultimos(prev, { at: Date.now(), callId, issue }));
  const pushIce = (callId: string, diag: IceDiagnostics) =>
    setRecentIce((prev) => ultimos(prev, { at: Date.now(), callId, diag }));

  const wireCall = (call: IncomingCall | OutgoingCall | ActiveCall | undefined): (() => void) => {
    if (!call) return () => {};
    const c = asCallLike(call);
    const unsubDiag = c.on("iceDiagnostics", (diag) => pushIce(c.id, diag));
    const unsubIssue = c.on("connectivityIssue", (issue) => pushIssue(c.id, issue));
    return () => {
      unsubDiag?.();
      unsubIssue?.();
    };
  };

  const ofertasLigadas = new Map<string, () => void>();
  let unsubActive: (() => void) | undefined;
  let unsubOutgoing: (() => void) | undefined;

  const unsubOffers = middleware.store.subscribe(
    (s) => s.offers,
    (offers) => {
      const vistas = new Set(offers.map((o) => o.id));
      for (const offer of offers) {
        if (!ofertasLigadas.has(offer.id)) ofertasLigadas.set(offer.id, wireCall(offer));
      }
      for (const [id, cleanup] of ofertasLigadas) {
        if (vistas.has(id)) continue;
        cleanup();
        ofertasLigadas.delete(id);
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

  onCleanup(() => {
    unsubOffers();
    unsubActiveSel();
    unsubOutgoingSel();
    unsubActive?.();
    unsubOutgoing?.();
    for (const cleanup of ofertasLigadas.values()) cleanup();
    ofertasLigadas.clear();
  });

  const value: DebugInfo = {
    get recentIssues() {
      return recentIssues();
    },
    get recentIceDiagnostics() {
      return recentIceDiagnostics();
    },
  };

  return <DebugContext.Provider value={value}>{props.children}</DebugContext.Provider>;
}

export function useDebugInfo(): DebugInfo {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error("useDebugInfo must be used inside DebugProvider");
  return ctx;
}

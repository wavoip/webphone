import type { ActiveCall, IncomingCall, OutgoingCall, Wavoip } from "@wavoip/wavoip-api/web";
import { createContext, createEffect, type JSX, onCleanup, useContext } from "solid-js";
import { toast } from "solid-sonner";
import { OfferNotification } from "@/components/OfferNotification";
import type { Middleware } from "@/middleware/Middleware";
import { useMiddleware } from "@/middleware/solid/context";
import type { CallStatus } from "@/middleware/store/slices/callSlice";
import type { DeviceStateEntry } from "@/middleware/store/slices/deviceSlice";
import { usePip } from "@/providers/PipProvider";
import { useSettings } from "@/providers/settings/Provider";
import { useWidget } from "@/providers/WidgetProvider";

type StartCall = Middleware["controllers"]["call"]["start"];

interface WavoipContextProps {
  readonly wavoip: Wavoip;
  readonly devices: DeviceStateEntry[];
  readonly offers: IncomingCall[];
  readonly callOutgoing?: OutgoingCall;
  readonly callActive?: ActiveCall;
  readonly callActiveStartedAt?: number;
  readonly callStatus: CallStatus;
  readonly peerMuted: boolean;
  readonly callFailReason?: string;
  addDevice: (token: string, persist?: boolean) => void;
  removeDevice: (token: string) => void;
  enableDevice: (token: string) => void;
  disableDevice: (token: string) => void;
  startCall: StartCall;
}

const WavoipContext = createContext<WavoipContextProps>();

export function WavoipProvider(props: { children: JSX.Element }) {
  const middleware = useMiddleware();
  const state = middleware.store.getState();
  const { callSettings } = useSettings();

  applyDisplayName(middleware, callSettings.displayName);
  bridgeOffersToToasts(middleware);
  followCallWithWidget(middleware);

  // Getters, e não valores: quem lê `callStatus` no JSX assina só esse campo.
  const value: WavoipContextProps = {
    wavoip: middleware.wavoip,
    get devices() {
      return state.devices;
    },
    get offers() {
      return state.offers;
    },
    get callOutgoing() {
      return state.outgoing;
    },
    get callActive() {
      return state.active;
    },
    get callActiveStartedAt() {
      return state.activeStartedAt;
    },
    get callStatus() {
      return state.callStatus;
    },
    get peerMuted() {
      return state.peerMuted;
    },
    get callFailReason() {
      return state.callFailReason;
    },
    startCall: (to, config) => middleware.controllers.call.start(to, config),
    addDevice: (token, persist) => middleware.controllers.device.add(token, persist),
    removeDevice: (token) => middleware.controllers.device.remove(token),
    enableDevice: (token) => middleware.controllers.device.enable(token),
    disableDevice: (token) => middleware.controllers.device.disable(token),
  };

  return <WavoipContext.Provider value={value}>{props.children}</WavoipContext.Provider>;
}

export function useWavoip(): WavoipContextProps {
  const context = useContext(WavoipContext);
  if (!context) throw new Error("useWavoip deve ser usado dentro de WavoipProvider");
  return context;
}

/** O nome que o integrador escolheu substitui o do peer, na oferta e na saída. */
function applyDisplayName(middleware: Middleware, displayName?: string) {
  if (!displayName) return;

  middleware.registry.use("offer", (offer, next) => {
    offer.peer.displayName = displayName;
    offer.peer.phone = displayName;
    next();
  });

  onCleanup(
    middleware.store.subscribe(
      (s) => s.outgoing,
      (outgoing) => {
        if (!outgoing) return;
        outgoing.peer.displayName = displayName;
        outgoing.peer.phone = displayName;
      },
    ),
  );
}

function bridgeOffersToToasts(middleware: Middleware) {
  onCleanup(
    middleware.store.subscribe(
      (s) => s.offers,
      (current, previous) => {
        for (const offer of current) {
          if (previous.some((p) => p.id === offer.id)) continue;
          toast(() => <OfferNotification offer={offer} />, {
            id: offer.id,
            duration: 100_000,
            class: "wv:max-w-[400px] wv:!w-full",
            // Arrastar o toast para longe é ignorar a chamada: para o toque, e não só
            // esconde a notificação. Também dispara nos nossos toast.dismiss(), onde o
            // ignore() não faz nada porque a oferta já saiu.
            onDismiss: () => offer.ignore(),
          });
        }
        for (const offer of previous) {
          if (current.some((c) => c.id === offer.id)) continue;
          setTimeout(() => toast.dismiss(offer.id), 2000);
        }
      },
    ),
  );
}

/**
 * O widget abre sozinho quando entra chamada e volta ao que era quando ela acaba — e o
 * mesmo vale ao entrar e sair do Picture-in-Picture, que esconde o widget da página.
 */
function followCallWithWidget(middleware: Middleware) {
  const { isClosed, setIsClosed, open: openWidget } = useWidget();
  const { isPiP } = usePip();
  let closedBeforePip: boolean | null = null;
  let closedBeforeCall: boolean | null = null;

  createEffect(() => {
    if (isPiP()) {
      if (closedBeforePip === null) closedBeforePip = isClosed();
      setIsClosed(true);
      return;
    }
    if (closedBeforePip !== null) {
      setIsClosed(closedBeforePip);
      closedBeforePip = null;
    }
  });

  onCleanup(
    middleware.store.subscribe(
      (s) => Boolean(s.active || s.outgoing),
      (inCall) => {
        if (inCall) {
          if (closedBeforeCall === null) closedBeforeCall = isClosed();
          if (!isPiP()) openWidget();
          return;
        }
        if (closedBeforeCall !== null) {
          if (closedBeforeCall) setIsClosed(true);
          closedBeforeCall = null;
        }
      },
    ),
  );
}

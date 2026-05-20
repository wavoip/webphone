import type { CallActive, CallOutgoing } from "@wavoip/wavoip-api";
import type { EventBus } from "@/middleware/events/EventBus";
import type { WebphoneEventMap } from "@/middleware/events/eventTypes";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

type Deps = { store: MiddlewareStoreApi; events: EventBus<WebphoneEventMap> };
export type Unsubscribe = () => void;

const TERMINAL: ReadonlySet<CallStatus> = new Set(["ended", "failed", "rejected", "unanswered"]);

/**
 * Bridges store state transitions to {@link WebphoneEventMap} broadcasts:
 * outgoing → `call:started`, active → `call:accepted`, terminal status →
 * `call:ended`. De-duplicates per call-id so re-renders never double-fire.
 */
export function callLifecycleEventsEffect({ store, events }: Deps): Unsubscribe {
  const unsubs = [
    subscribeStartedFromOutgoing(store, events),
    subscribeAcceptedFromActive(store, events),
    subscribeEndedFromStatus(store, events),
  ];
  return () => {
    for (const u of unsubs) u();
  };
}

function subscribeStartedFromOutgoing(store: MiddlewareStoreApi, events: EventBus<WebphoneEventMap>): Unsubscribe {
  return store.subscribe(
    (s) => s.outgoing,
    (current, previous) => {
      if (!current) return;
      if (previous?.id === current.id) return;
      events.emit("call:started", projectOutgoing(current));
    },
  );
}

function subscribeAcceptedFromActive(store: MiddlewareStoreApi, events: EventBus<WebphoneEventMap>): Unsubscribe {
  return store.subscribe(
    (s) => s.active,
    (current, previous) => {
      if (!current) return;
      if (previous?.id === current.id) return;
      events.emit("call:accepted", projectActive(current));
    },
  );
}

function subscribeEndedFromStatus(store: MiddlewareStoreApi, events: EventBus<WebphoneEventMap>): Unsubscribe {
  return store.subscribe(
    (s) => s.callStatus,
    (status) => {
      if (!TERMINAL.has(status)) return;
      const { active, outgoing } = store.getState();
      const id = active?.id ?? outgoing?.id;
      if (!id) return;
      events.emit("call:ended", { id, status });
    },
  );
}

function projectOutgoing(call: CallOutgoing) {
  const { id, type, status, device_token, direction, peer } = call;
  return { id, type, status, device_token, direction, peer };
}

function projectActive(call: CallActive) {
  const { id, type, status, device_token, direction, peer } = call;
  return { id, type, status, device_token, direction, peer };
}

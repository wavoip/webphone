import { TERMINAL_CALL_STATUSES as TERMINAL } from "@/middleware/store/callStatus";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi; delayMs?: number };
export type Unsubscribe = () => void;

const DEFAULT_DELAY_MS = 3000;

export function resetCallTimerEffect({ store, delayMs = DEFAULT_DELAY_MS }: Deps): Unsubscribe {
  let pending: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = store.subscribe(
    (state) => state.callStatus,
    (status) => {
      // Leaving a terminal status disarms the timer. A call can come back — an
      // instance that does not propagate the cancel result acks `call.cancel` with
      // success even when the peer answered in the same instant, so the status goes
      // terminal and then straight to ACTIVE. Returning early here left the timer
      // running and wiped a live call three seconds later.
      if (!TERMINAL.has(status)) {
        if (pending) clearTimeout(pending);
        pending = undefined;
        return;
      }
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => {
        pending = undefined;
        store.getState().resetCall();
      }, delayMs);
    },
  );

  return () => {
    if (pending) clearTimeout(pending);
    pending = undefined;
    unsubscribe();
  };
}

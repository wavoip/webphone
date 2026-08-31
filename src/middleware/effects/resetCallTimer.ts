import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

type Deps = { store: MiddlewareStoreApi; delayMs?: number };
export type Unsubscribe = () => void;

// "CANCELLED" is terminal like any other outcome — without it the screen never
// returns to the keyboard after a cancellation. This Set has a twin in
// callLifecycleEvents; the two move together.
const TERMINAL: ReadonlySet<CallStatus> = new Set(["ENDED", "FAILED", "REJECTED", "NOT_ANSWERED", "CANCELLED"]);
const DEFAULT_DELAY_MS = 3000;

export function resetCallTimerEffect({ store, delayMs = DEFAULT_DELAY_MS }: Deps): Unsubscribe {
  let pending: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = store.subscribe(
    (state) => state.callStatus,
    (status) => {
      if (!TERMINAL.has(status)) return;
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

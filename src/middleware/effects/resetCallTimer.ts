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

import { shallow } from "zustand/shallow";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi };

export type Unsubscribe = () => void;

/**
 * Drives `screen` from call lifecycle state. While a call is active or ringing
 * the screen tracks it; once everything clears and status resets to `idle`,
 * the screen returns to the keyboard. Terminal statuses like `ENDED` / `FAILED`
 * deliberately do NOT bounce back to keyboard so the user sees the final
 * status — `resetCall()` (which sets `idle`) is the explicit "go home" signal.
 */
export function screenSyncEffect({ store }: Deps): Unsubscribe {
  return store.subscribe(
    (s) => ({ active: s.active, outgoing: s.outgoing, status: s.callStatus }),
    ({ active, outgoing, status }) => {
      if (active) {
        store.getState().setScreen("call");
        return;
      }
      if (outgoing) {
        store.getState().setScreen("outgoing");
        return;
      }
      if (status === "idle") store.getState().setScreen("keyboard");
    },
    { equalityFn: shallow },
  );
}

import { shallow } from "zustand/shallow";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi };

export type Unsubscribe = () => void;

/**
 * Status terminal (`ENDED`, `FAILED`…) NÃO volta ao teclado, de propósito, para o
 * usuário ver como a chamada acabou. Quem volta é o `idle` do `resetCall()`.
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

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
      // Sair de um status terminal desarma o timer, porque a chamada pode voltar: uma
      // instance que não propaga o resultado do cancelamento confirma o `call.cancel`
      // mesmo quando o peer atendeu no mesmo instante, e o status vai de terminal
      // direto para ACTIVE.
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

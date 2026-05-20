import type { MiddlewareStoreApi } from "@/middleware/store/createStore";
import type { CallStatus } from "@/middleware/store/slices/callSlice";

type Deps = { store: MiddlewareStoreApi };
export type Unsubscribe = () => void;

const IN_CALL: ReadonlySet<CallStatus> = new Set(["CALLING", "RINGING", "ACTIVE", "DISCONNECTED"]);

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
  return "";
}

export function beforeUnloadEffect({ store }: Deps): Unsubscribe {
  let registered = false;

  const register = () => {
    if (registered) return;
    window.addEventListener("beforeunload", handleBeforeUnload);
    registered = true;
  };

  const unregister = () => {
    if (!registered) return;
    window.removeEventListener("beforeunload", handleBeforeUnload);
    registered = false;
  };

  const unsubscribe = store.subscribe(
    (state) => state.callStatus,
    (status) => {
      if (IN_CALL.has(status)) register();
      else unregister();
    },
  );

  return () => {
    unregister();
    unsubscribe();
  };
}

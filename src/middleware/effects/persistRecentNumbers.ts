import { saveRecentNumbers } from "@/lib/recent-numbers";
import type { MiddlewareStoreApi } from "@/middleware/store/createStore";

type Deps = { store: MiddlewareStoreApi };
export type Unsubscribe = () => void;

export function persistRecentNumbersEffect({ store }: Deps): Unsubscribe {
  return store.subscribe(
    (state) => state.recentNumbers,
    (numbers) => saveRecentNumbers(numbers),
  );
}

import { useCallback, useSyncExternalStore } from "react";
import { bus } from "@/lib/webphone-api/bus";
import type { EventType, QueryResult, QueryType } from "@/lib/webphone-api/events";

/**
 * Subscribes a React component to a bus query, re-rendering when `changeEvent` fires.
 *
 * Example:
 *   const isOpen = useBusState("widget.isOpen", "widget.changed");
 *
 * `changeEvent` must be a stable string literal — the subscribe identity depends on it.
 */
export function useBusState<Q extends QueryType>(queryKey: Q, changeEvent: EventType): QueryResult<Q> {
  const subscribe = useCallback((notify: () => void) => bus.on(changeEvent, () => notify()), [changeEvent]);
  const getSnapshot = useCallback(() => bus.query(queryKey), [queryKey]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

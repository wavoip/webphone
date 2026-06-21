/**
 * Typed pub/sub used to expose middleware lifecycle events to programmatic
 * consumers (`window.wavoip.on("call:started", cb)`). Distinct from
 * {@link MiddlewareRegistry}, which runs an Express-style chain on inbound
 * payloads; this bus is fire-and-forget broadcast.
 */
export class EventBus<TMap extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof TMap, Set<(payload: never) => void>>();

  on<K extends keyof TMap>(event: K, cb: (payload: TMap[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(cb as (payload: never) => void);
    this.listeners.set(event, set);
    return () => {
      set.delete(cb as (payload: never) => void);
    };
  }

  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        (cb as (payload: TMap[K]) => void)(payload);
      } catch (err) {
        console.error(`[EventBus] subscriber for "${String(event)}" threw:`, err);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

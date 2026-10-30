import type { CallActive, CallStats } from "@wavoip/wavoip-api";
import { useEffect, useState } from "react";

/**
 * Polls `call.getStats()` while `enabled`, returning the latest snapshot (null until the first one).
 * The next pull is scheduled only after the previous one settles, so a slow getStats never piles up
 * concurrent requests the way a fixed setInterval would.
 *
 * @example
 * const stats = useCallStats(call, 500);
 * const rtt = stats?.rtt.avg;
 */
export function useCallStats(call: CallActive, intervalMs: number, enabled = true): CallStats | null {
  const [stats, setStats] = useState<CallStats | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const pull = async () => {
      // A failed sample (e.g. transport mid-reconnect) keeps the last snapshot; polling continues.
      const next = await call.getStats().catch(() => null);
      if (cancelled) return;
      if (next) setStats(next);
      timer = setTimeout(pull, intervalMs);
    };
    pull();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [call, intervalMs, enabled]);

  return stats;
}

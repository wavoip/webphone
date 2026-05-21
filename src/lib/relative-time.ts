/**
 * Compact PT-BR relative-time formatter used in notifications. Replaces a
 * single moment.js call site so the heavy dep can be dropped from the bundle.
 * Output mirrors the compact suffix style of `moment(...).fromNow(true)` but
 * uses abbreviations (`min`, `h`, `d`) instead of full words.
 */
export function relativeTimePt(then: Date, now: Date = new Date()): string {
  const diffSec = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

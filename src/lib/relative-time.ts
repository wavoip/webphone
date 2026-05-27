import { getLanguage, type Language } from "@/lib/i18n";

type RelativeSuffix = { now: string; min: string; hour: string; day: string };

const SUFFIX: Record<Language, RelativeSuffix> = {
  en: { now: "now", min: "min", hour: "h", day: "d" },
  "pt-BR": { now: "agora", min: "min", hour: "h", day: "d" },
  es: { now: "ahora", min: "min", hour: "h", day: "d" },
};

function activeSuffix(): RelativeSuffix {
  const lang = getLanguage();
  return (SUFFIX as Record<string, RelativeSuffix>)[lang] ?? SUFFIX["pt-BR"];
}

/**
 * Locale-aware compact relative-time formatter used in notifications. Mirrors
 * `moment(...).fromNow(true)` but with abbreviations (`min`, `h`, `d`) and a
 * localized "now" word.
 */
export function relativeTime(then: Date, now: Date = new Date()): string {
  const s = activeSuffix();
  const diffSec = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (diffSec < 60) return s.now;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}${s.min}`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}${s.hour}`;
  return `${Math.floor(diffSec / 86400)}${s.day}`;
}

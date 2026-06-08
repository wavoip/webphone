import { useEffect, useRef, useState } from "react";

type Props = {
  analyser: AnalyserNode | null;
  width?: number;
};

const FRAME_INTERVAL_MS = 50;

/**
 * Slim horizontal level bar. Reads `getByteTimeDomainData` at ~20fps, scales
 * the peak deviation from the 128 mid-line into a 0–1 fill value. State updates
 * only when the bucketed percentage actually changes, so React skips no-op
 * renders. Renders nothing when `analyser` is null so the caller can hide it.
 */
export function AudioLevelMeter({ analyser, width = 60 }: Props) {
  const [pct, setPct] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) {
      setPct(0);
      return;
    }
    const buffer = new Uint8Array(analyser.fftSize);
    let lastPct = -1;
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let peak = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = Math.abs(buffer[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      const next = Math.min(100, Math.round(peak * 140));
      if (next !== lastPct) {
        lastPct = next;
        setPct(next);
      }
    };
    timerRef.current = window.setInterval(tick, FRAME_INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [analyser]);

  if (!analyser) return null;
  return (
    <div
      className="wv:relative wv:h-1 wv:rounded-full wv:bg-foreground/15 wv:overflow-hidden"
      style={{ width }}
      aria-hidden
    >
      <div
        className="wv:absolute wv:inset-y-0 wv:left-0 wv:bg-emerald-500 wv:transition-[width] wv:duration-75 wv:ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

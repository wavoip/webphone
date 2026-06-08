import { useEffect, useRef, useState } from "react";

type Props = {
  analyser: AnalyserNode | null;
  bars?: number;
};

const FRAME_INTERVAL_MS = 50;

/**
 * Horizontal bar-strip volume meter. Reads `getByteTimeDomainData` at ~20fps,
 * normalizes peak deviation from the 128 mid-line to 0–1, lights up the
 * proportional count of `bars`. State updates only when the lit-bar count
 * actually changes so React skips no-op renders. Renders nothing when
 * `analyser` is null so the caller can lay out around it.
 */
export function AudioLevelMeter({ analyser, bars = 8 }: Props) {
  const [lit, setLit] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) {
      setLit(0);
      return;
    }
    const buffer = new Uint8Array(analyser.fftSize);
    let lastLit = -1;
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let peak = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = Math.abs(buffer[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      const next = Math.min(bars, Math.floor(peak * bars * 1.4));
      if (next !== lastLit) {
        lastLit = next;
        setLit(next);
      }
    };
    timerRef.current = window.setInterval(tick, FRAME_INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [analyser, bars]);

  if (!analyser) return null;
  return (
    <div className="wv:flex wv:items-end wv:gap-[2px] wv:h-3" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={`bar-${i}-of-${bars}`}
          className={
            "wv:w-[3px] wv:rounded-sm wv:transition-opacity " +
            (i < lit ? "wv:bg-green-500 wv:opacity-100" : "wv:bg-foreground/20")
          }
          style={{ height: `${4 + (i / bars) * 8}px` }}
        />
      ))}
    </div>
  );
}

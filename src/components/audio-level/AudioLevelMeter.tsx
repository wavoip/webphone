import { useEffect, useRef, useState } from "react";

type Props = {
  analyser: AnalyserNode | null;
  bars?: number;
};

/**
 * Horizontal bar-strip volume meter. Reads `getByteTimeDomainData` every frame,
 * normalizes peak deviation from the 128 mid-line to 0–1, lights up the
 * proportional count of `bars`. Renders nothing when `analyser` is null so the
 * caller can lay out around it.
 */
export function AudioLevelMeter({ analyser, bars = 8 }: Props) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser) {
      setLevel(0);
      return;
    }
    const buffer = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let peak = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = Math.abs(buffer[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      setLevel(peak);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser]);

  if (!analyser) return null;

  const lit = Math.min(bars, Math.floor(level * bars * 1.4));
  return (
    <div className="wv:flex wv:items-end wv:gap-[2px] wv:h-3" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
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

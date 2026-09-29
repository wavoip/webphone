import type { AudioAnalyser } from "@wavoip/wavoip-api/web";
import { useEffect, useRef } from "react";

type Props = {
  analyser: AudioAnalyser;
  label: string;
};

export function AudioLevelBar({ analyser, label }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (!fillRef.current) return;
      fillRef.current.style.width = `${Math.min(100, analyser.level() * 100)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return (
    <div className="wv:flex wv:flex-col wv:gap-1">
      <span className="wv:text-[12px] wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {label}
      </span>
      <div className="wv:h-2 wv:w-full wv:overflow-hidden wv:rounded wv:bg-muted/40">
        <div ref={fillRef} className="wv:h-full wv:bg-emerald-500" style={{ width: "0%" }} />
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

type Props = {
  analyser: Promise<AnalyserNode>;
  label: string;
};

export function AudioLevelBar({ analyser, label }: Props) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;

    analyser.then((node) => {
      if (cancelled || typeof node.getFloatTimeDomainData !== "function") return;
      const buf = new Float32Array(node.fftSize);
      const tick = () => {
        if (cancelled || !fillRef.current) return;
        node.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const pct = Math.min(100, rms * 200);
        fillRef.current.style.width = `${pct}%`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [analyser]);

  return (
    <div className="wv:flex wv:flex-col wv:gap-1">
      <span className="wv:text-[10px] wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {label}
      </span>
      <div className="wv:h-2 wv:w-full wv:overflow-hidden wv:rounded wv:bg-muted/40">
        <div ref={fillRef} className="wv:h-full wv:bg-emerald-500" style={{ width: "0%" }} />
      </div>
    </div>
  );
}

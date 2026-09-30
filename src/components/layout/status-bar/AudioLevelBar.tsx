import type { AudioAnalyser } from "@wavoip/wavoip-api/web";
import { onCleanup, onMount } from "solid-js";

type Props = {
  analyser: AudioAnalyser;
  label: string;
};

export function AudioLevelBar(props: Props) {
  let fill: HTMLDivElement | undefined;

  onMount(() => {
    let raf = 0;
    const tick = () => {
      if (fill) fill.style.width = `${Math.min(100, props.analyser.level() * 100)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    onCleanup(() => cancelAnimationFrame(raf));
  });

  return (
    <div class="wv:flex wv:flex-col wv:gap-1">
      <span class="wv:text-[12px] wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
        {props.label}
      </span>
      <div class="wv:h-2 wv:w-full wv:overflow-hidden wv:rounded wv:bg-muted/40">
        <div ref={fill} class="wv:h-full wv:bg-emerald-500" style={{ width: "0%" }} />
      </div>
    </div>
  );
}

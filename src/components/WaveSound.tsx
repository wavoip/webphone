import type { CallActive } from "@wavoip/wavoip-api";
import { useTheme } from "next-themes";
import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { drawSoundwave } from "@/lib/picture-in-picture";

type Props = {
  call?: CallActive;
};

const CSS_HEIGHT = 50;

export function WaveSound({ call }: Props) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIDRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = CSS_HEIGHT * dpr;
  }, []);

  useEffect(() => {
    call?.audio_analyser?.then((analyser) => {
      if (!canvasRef.current) return;
      draw(canvasRef.current, analyser, animationIDRef, theme);
    });
  }, [call?.audio_analyser, theme]);

  useEffect(() => {
    return () => {
      if (animationIDRef.current) {
        cancelAnimationFrame(animationIDRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "70px", height: `${CSS_HEIGHT}px`, display: "block" }}
    />
  );
}

function draw(
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
  animationRef: RefObject<number | null>,
  theme?: string,
) {
  animationRef.current = requestAnimationFrame(() => draw(canvas, analyser, animationRef, theme));

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  drawSoundwave(canvas, dataArray, {
    bars: 13,
    gap: 2,
    color: theme === "dark" ? "#00ff66" : "#008000",
  });
}

import type { CallActive } from "@wavoip/wavoip-api";
import { useTheme } from "next-themes";
import { type RefObject, useEffect, useRef } from "react";

type Props = {
  call?: CallActive;
};

export function WaveSound({ call }: Props) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIDRef = useRef<number | null>(null);

  useEffect(() => {
    call?.audio_analyser?.then((analyser) => {
      if (!canvasRef.current) {
        return;
      }

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
    <div className="text-center">
      <canvas
        ref={canvasRef}
        width={75}
        height={35}
        style={{
          width: "75px",
          height: "50px",
          display: "block",
        }}
      />
    </div>
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
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  ctx.fillStyle = theme === "dark" ? "#1a1b1e" : "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

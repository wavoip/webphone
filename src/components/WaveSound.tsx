import type { ActiveCall, AudioAnalyser } from "@wavoip/wavoip-api/web";
import { useEffect, useRef } from "react";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type Props = {
  call?: ActiveCall;
};

const BARS = 15;
const GAP = 2;

export function WaveSound({ call }: Props) {
  const { root } = useShadowRoot();
  const theme = root.classList.contains("dark") ? "dark" : "light";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothRef = useRef<number[]>(Array(BARS).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!call || !canvas) return;
    let animationId = 0;

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      draw(canvas, call.audio.in, smoothRef.current, theme);
    };
    loop();

    return () => cancelAnimationFrame(animationId);
  }, [call, theme]);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} width={75} height={35} style={{ width: "75px", height: "50px", display: "block" }} />
    </div>
  );
}

function draw(canvas: HTMLCanvasElement, analyser: AudioAnalyser, smooth: number[], theme?: string) {
  const dataArray = analyser.spectrum();

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBars(ctx, dataArray, canvas.width, canvas.height, smooth, theme === "dark" ? "#00ff66" : "#008000");
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  dataArray: Uint8Array,
  width: number,
  height: number,
  smooth: number[],
  color: string,
) {
  ctx.fillStyle = color;

  const step = Math.floor(dataArray.length / BARS);
  const barWidth = (width - GAP * (BARS - 1)) / BARS;
  const center = Math.floor(BARS / 2);

  for (let k = 0; k < BARS; k++) {
    const offset = k - center;
    const index = Math.abs(offset);

    let sum = 0;
    for (let j = 0; j < step; j++) sum += dataArray[index * step + j];

    const targetHeight = Math.max((sum / step / 255) ** 0.6 * height, 3);
    smooth[k] = smooth[k] * 0.75 + targetHeight * 0.25;

    const barX = center * (barWidth + GAP) + offset * (barWidth + GAP);
    drawRoundedRect(ctx, barX, (height - smooth[k]) / 2, barWidth, smooth[k], 3);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

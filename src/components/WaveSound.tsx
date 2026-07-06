import type { CallActive } from "@wavoip/wavoip-api";
import { type RefObject, useEffect, useRef } from "react";
import { useShadowRoot } from "@/providers/ShadowRootProvider";

type Props = {
  call?: CallActive;
};

export function WaveSound({ call }: Props) {
  const { root } = useShadowRoot();
  const theme = root.classList.contains("dark") ? "dark" : "light";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIDRef = useRef<number | null>(null);

  useEffect(() => {
    call?.audioAnalyserIn?.then((analyser) => {
      if (!canvasRef.current) return;
      draw(canvasRef.current, analyser, animationIDRef, theme);
    });
  }, [call?.audioAnalyserIn, theme]);

  useEffect(() => {
    return () => {
      if (animationIDRef.current) cancelAnimationFrame(animationIDRef.current);
    };
  }, []);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} width={75} height={35} style={{ width: "75px", height: "50px", display: "block" }} />
    </div>
  );
}

const BARS = 15;
const GAP = 2;
let smooth: number[] = [];

function draw(
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
  animationRef: RefObject<number | null>,
  theme?: string,
) {
  animationRef.current = requestAnimationFrame(() => draw(canvas, analyser, animationRef, theme));

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBars(ctx, dataArray, canvas.width, canvas.height, theme === "dark" ? "#00ff66" : "#008000");
}

function drawBars(ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number, color: string) {
  ctx.fillStyle = color;

  const step = Math.floor(dataArray.length / BARS);
  const barWidth = (width - GAP * (BARS - 1)) / BARS;
  const center = Math.floor(BARS / 2);

  if (smooth.length !== BARS) smooth = Array(BARS).fill(0);

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

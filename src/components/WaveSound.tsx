import type { CallActive } from "@wavoip/wavoip-api";
import { type RefObject, useEffect, useRef } from "react";
import { drawSoundwave } from "@/lib/picture-in-picture";

type Props = {
  call?: CallActive;
};

export function WaveSound({ call }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIDRef = useRef<number | null>(null);

  useEffect(() => {
    call?.audio_analyser.then((analyser) => {
      if (!canvasRef.current) {
        return;
      }

      draw(canvasRef.current, analyser, animationIDRef);
    });
  }, [call?.audio_analyser]);

  useEffect(() => {
    return () => {
      if (animationIDRef.current) {
        cancelAnimationFrame(animationIDRef.current);
      }
    };
  }, []);

  return (
    <div className="text-center">
      <canvas ref={canvasRef} width={75} height={40} />
    </div>
  );
}

function draw(canvas: HTMLCanvasElement, analyser: AnalyserNode, animationRef: RefObject<number | null>) {
  animationRef.current = requestAnimationFrame(() => draw(canvas, analyser, animationRef));
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSoundwave(canvas, dataArray, { gap: 2 });
}

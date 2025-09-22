import { useWavoip } from "@/providers/WavoipProvider";
import React, { useEffect, useRef, useState } from "react";

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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


export default function EqualizerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [listening, setListening] = useState(false);
  const { wavoipInstance, callActive } = useWavoip();

  useEffect(() => {
    if (!callActive) {
      return;
    }

    try {
      const analyser = wavoipInstance.multimedia.audio.analyser_node;

      if (!analyser) {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      function draw() {
        requestAnimationFrame(draw);
        analyser!.getByteFrequencyData(dataArray);

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const numBars = 15; // número fixo de pilares
        const step = Math.floor(bufferLength / numBars);

        const barWidth = 2; // espaçamento
        let x = 0;


        for (let i = 0; i < numBars; i++) {
          // média dos valores no grupo
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          const avg = sum / step;

          let barHeight = (avg / 255) * canvas.height;
          barHeight = barHeight > 4 ? barHeight : 4;
          const y = (canvas.height - barHeight) / 2;

          ctx.fillStyle = "green";
          // ctx.fillRect(
          //   x,
          //   y,
          //   barWidth,
          //   barHeight,

          // );

          drawRoundedRect(ctx, x, y, barWidth, barHeight, 1);


          x += barWidth + 3; // move para próxima barra
        }
      }

      draw();
    } catch (err) {
      console.error("Wave sound error to render", err)
    }
  }, [callActive, wavoipInstance.multimedia.audio.analyser_node]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} width={75} height={40} />
    </div>
  );
}

import type { CallActive, CallOutgoing } from "@wavoip/wavoip-api";

export const pictureInPicture: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  call: CallOutgoing | CallActive | null;
  animationID: number | null;
} = {
  video: document.createElement("video"),
  canvas: document.createElement("canvas"),
  call: null,
  animationID: null,
};

export function enablePiP() {
  // document.addEventListener("visibilitychange", () => {
  //   handlePictureInPicture(webphoneRef);
  // });
}

export function disablePiP() {
  document.removeEventListener("visibilitychange", handlePictureInPicture);

  if (pictureInPicture.animationID) {
    cancelAnimationFrame(pictureInPicture.animationID);
    pictureInPicture.animationID = null;
  }
}

async function handlePictureInPicture() {
  if (!document.pictureInPictureEnabled) return;

  if (document.hidden && !document.pictureInPictureElement) {
    const { canvas, video } = pictureInPicture;

    canvas.width = 200;
    canvas.height = 200;

    drawPictureInPicture(canvas);

    video.height = 200;
    video.width = 200;
    video.srcObject = canvas.captureStream();
    video.muted = true;
    video.play();

    video.addEventListener("loadedmetadata", () => video.requestPictureInPicture(), { once: true });
    return;
  }

  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();

    if (pictureInPicture.animationID) {
      cancelAnimationFrame(pictureInPicture.animationID);
      pictureInPicture.animationID = null;
    }
  }
}

async function drawPictureInPicture(canvas: HTMLCanvasElement) {
  pictureInPicture.animationID = requestAnimationFrame(() => drawPictureInPicture(canvas));

  const { call } = pictureInPicture;

  if (!call) return;

  const margin = 10;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pictureCoords = {
    x: margin,
    y: margin,
    width: 0,
    height: 0,
  };

  if (call.peer?.profilePicture) {
    pictureCoords.height = canvas.height / 2 - 2 * margin;
    pictureCoords.width = pictureCoords.height;

    const { x, y, height, width } = pictureCoords;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = call.peer?.profilePicture;
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height);
    };
  }

  // const nameCoords = {
  //   x: pictureCoords.x + pictureCoords.width + margin,
  //   y: margin,
  // };

  // ctx.fillStyle = "black";
  // ctx.font = "12px sans-serif";
  // ctx.fillText(call.peer.displayName || call.peer.number, nameCoords.x, nameCoords.y);

  // if ("audio_analyser" in call) {
  //   const analyser = await call.audio_analyser;
  //   const bufferLength = analyser.frequencyBinCount;
  //   const soundBuffer = new Uint8Array(bufferLength);
  //   analyser.getByteFrequencyData(soundBuffer);

  //   const soundwaveCoords = {
  //     x: pictureCoords.x,
  //     y: pictureCoords.y + pictureCoords.height + margin,
  //     width: canvas.width - 2 * margin,
  //     height: canvas.height - pictureCoords.height - margin,
  //   };

  //   drawSoundwave(canvas, soundBuffer, {
  //     x: soundwaveCoords.x,
  //     y: soundwaveCoords.y,
  //     width: soundwaveCoords.width,
  //     height: soundwaveCoords.height,
  //     gap: 5,
  //   });
  // }
}

export function drawSoundwave(
  canvas: HTMLCanvasElement,
  soundBuffer: Uint8Array,
  config: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    bars?: number;
    gap?: number;
    color?: string;
  } = {},
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Ajusta a resolução interna
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  ctx.scale(dpr, dpr);

  ctx.imageSmoothingEnabled = false;
  ctx.translate(0.5, 0.5); // evita subpixel blur

  const {
    x = 0,
    y = 0,
    bars = 15,
    gap = 2,
    width = displayWidth,
    height = displayHeight,
    color = config.color ?? "#00ff66",
  } = config;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;

  const step = Math.floor(soundBuffer.length / bars);
  const barWidth = (width - gap * (bars - 1)) / bars;

  for (let i = 0; i < bars; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) sum += soundBuffer[i * step + j];

    const avg = sum / step;
    const barHeight = Math.max((avg / 255) * height, 3);
    const barX = x + i * (barWidth + gap);
    const barY = y + (height - barHeight) / 2;

    drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 2);
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

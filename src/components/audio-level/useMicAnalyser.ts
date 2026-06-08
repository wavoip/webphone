import { useEffect, useState } from "react";

type Options = { deviceId: string | null; enabled: boolean };

/**
 * Acquires a `getUserMedia` stream from the given mic deviceId and exposes a
 * WebAudio AnalyserNode tapped off it. Re-acquires when `deviceId` or
 * `enabled` change. Cleans up the stream + AudioContext on unmount or when
 * `enabled` flips false. Returns null while not ready.
 */
export function useMicAnalyser({ deviceId, enabled }: Options): AnalyserNode | null {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!enabled || !deviceId) {
      setAnalyser(null);
      return;
    }

    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createAnalyser();
        node.fftSize = 512;
        node.smoothingTimeConstant = 0.3;
        source.connect(node);
        setAnalyser(node);
      } catch (err) {
        console.warn("[useMicAnalyser] getUserMedia failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      setAnalyser(null);
      if (stream) for (const track of stream.getTracks()) track.stop();
      if (ctx) void ctx.close();
    };
  }, [deviceId, enabled]);

  return analyser;
}

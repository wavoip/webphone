import { useEffect, useState } from "react";

type Options = {
  deviceId: string | null;
  playback: boolean;
  speakerId: string | null;
};

type SinkAudio = HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };

export type MicAnalyserResult = { analyser: AnalyserNode | null };

/**
 * Owns the entire mic-monitor chain. Acquires `getUserMedia`, builds the
 * source→analyser→gain→destination→<audio> pipeline, plays the audio out to
 * `speakerId`, and exposes the AnalyserNode for metering — but ONLY while
 * `playback` is true. Off by default: no permissions probe, no stream, no
 * AudioContext. Gain capped at 0.6 to limit feedback. Returns `null` analyser
 * when idle so consumers skip rendering.
 */
export function useMicAnalyser({ deviceId, playback, speakerId }: Options): MicAnalyserResult {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!playback || !deviceId) {
      setAnalyser(null);
      return;
    }
    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let audio: SinkAudio | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: false,
        });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createAnalyser();
        node.fftSize = 512;
        node.smoothingTimeConstant = 0.3;
        source.connect(node);
        const gain = ctx.createGain();
        gain.gain.value = 0.6;
        node.connect(gain);
        const dest = ctx.createMediaStreamDestination();
        gain.connect(dest);
        audio = new Audio() as SinkAudio;
        audio.srcObject = dest.stream;
        if (typeof audio.setSinkId === "function" && speakerId) {
          audio.setSinkId(speakerId).catch((err) => {
            console.warn("[useMicAnalyser] setSinkId failed:", err);
          });
        }
        if (ctx.state === "suspended") void ctx.resume();
        await audio.play().catch((err) => {
          console.warn("[useMicAnalyser] play failed:", err);
        });
        if (cancelled) return;
        setAnalyser(node);
      } catch (err) {
        console.warn("[useMicAnalyser] setup failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      setAnalyser(null);
      if (audio) audio.pause();
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (ctx) void ctx.close();
    };
  }, [deviceId, playback, speakerId]);

  return { analyser };
}

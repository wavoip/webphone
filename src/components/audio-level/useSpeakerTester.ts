import { useCallback, useEffect, useRef, useState } from "react";
import TestSound from "@/assets/sounds/dtmf-1.mp3";

type Options = { deviceId: string | null };

type SinkAudio = HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };

type Refs = {
  ctx: AudioContext;
  audio: SinkAudio;
  analyser: AnalyserNode;
};

/**
 * Lazy speaker test. Nothing is allocated until `play()` is first invoked —
 * then it builds an AudioContext, <audio> element, AnalyserNode chain, routes
 * via `setSinkId(deviceId)` (Firefox no-op) and starts the test tone.
 * `playing` flips true while the tone is audible and false on `ended`, so
 * consumers know when to render the meter. Tears down on unmount.
 */
export function useSpeakerTester({ deviceId }: Options): {
  analyser: AnalyserNode | null;
  play: () => void;
  playing: boolean;
} {
  const refs = useRef<Refs | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      const r = refs.current;
      refs.current = null;
      if (!r) return;
      r.audio.pause();
      void r.ctx.close();
    };
  }, []);

  useEffect(() => {
    const r = refs.current;
    if (!r) return;
    if (typeof r.audio.setSinkId !== "function" || !deviceId) return;
    r.audio.setSinkId(deviceId).catch((err) => {
      console.warn("[useSpeakerTester] setSinkId failed:", err);
    });
  }, [deviceId]);

  const play = useCallback(() => {
    if (!refs.current) {
      const ctx = new AudioContext();
      const audio = new Audio(TestSound) as SinkAudio;
      audio.crossOrigin = "anonymous";
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("pause", () => setPlaying(false));
      if (typeof audio.setSinkId === "function" && deviceId) {
        audio.setSinkId(deviceId).catch((err) => {
          console.warn("[useSpeakerTester] setSinkId failed:", err);
        });
      }
      refs.current = { ctx, audio, analyser };
    }
    const r = refs.current;
    if (r.ctx.state === "suspended") void r.ctx.resume();
    r.audio.currentTime = 0;
    setPlaying(true);
    void r.audio.play().catch((err) => {
      console.warn("[useSpeakerTester] play failed:", err);
      setPlaying(false);
    });
  }, [deviceId]);

  return { analyser: playing ? (refs.current?.analyser ?? null) : null, play, playing };
}

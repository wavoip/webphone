import { useCallback, useEffect, useRef, useState } from "react";
import TestSound from "@/assets/sounds/dtmf-1.mp3";

type Options = { deviceId: string | null; enabled: boolean };

type SinkAudio = HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };

/**
 * Owns an `<audio>` element pre-wired to an AnalyserNode for the speaker
 * meter and exposes a `play()` callback that pipes a short test tone through
 * the currently-selected speaker. The element is rebuilt when `deviceId`
 * changes so `setSinkId` reroutes output; `enabled=false` tears everything
 * down. `setSinkId` is best-effort — Firefox does not implement it.
 */
export function useSpeakerTester({ deviceId, enabled }: Options): { analyser: AnalyserNode | null; play: () => void } {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) {
      setAnalyser(null);
      return;
    }
    const audio = new Audio(TestSound) as SinkAudio;
    audio.crossOrigin = "anonymous";
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const node = ctx.createAnalyser();
    node.fftSize = 512;
    node.smoothingTimeConstant = 0.3;
    source.connect(node);
    node.connect(ctx.destination);
    audioRef.current = audio;
    ctxRef.current = ctx;
    setAnalyser(node);

    return () => {
      audio.pause();
      void ctx.close();
      audioRef.current = null;
      ctxRef.current = null;
      setAnalyser(null);
    };
  }, [enabled]);

  useEffect(() => {
    const audio = audioRef.current as SinkAudio | null;
    if (!audio || !deviceId) return;
    if (typeof audio.setSinkId !== "function") return;
    audio.setSinkId(deviceId).catch((err) => {
      console.warn("[useSpeakerTester] setSinkId failed:", err);
    });
  }, [deviceId]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    const ctx = ctxRef.current;
    if (!audio || !ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    audio.currentTime = 0;
    void audio.play().catch((err) => {
      console.warn("[useSpeakerTester] play failed:", err);
    });
  }, []);

  return { analyser, play };
}

import { useEffect, useRef, useState } from "react";

type Options = {
  deviceId: string | null;
  enabled: boolean;
  playback: boolean;
  speakerId: string | null;
};

type SinkAudio = HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };

type CoreRefs = {
  stream: MediaStream;
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
};

type PlaybackRefs = {
  gain: GainNode;
  dest: MediaStreamAudioDestinationNode;
  audio: SinkAudio;
};

export type MicAnalyserResult = { analyser: AnalyserNode | null };

/**
 * Acquires a `getUserMedia` stream from the given mic deviceId and exposes a
 * WebAudio AnalyserNode tapped off it. When `playback` toggles true, lazily
 * builds a gain→destination→audio chain so the user hears their own mic
 * (sidetone), routed to `speakerId` via `setSinkId`. Gain capped at 0.6 to
 * limit feedback risk. Re-acquires when `deviceId`/`enabled` change; tears
 * down on unmount.
 */
export function useMicAnalyser({ deviceId, enabled, playback, speakerId }: Options): MicAnalyserResult {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const coreRef = useRef<CoreRefs | null>(null);
  const playbackRef = useRef<PlaybackRefs | null>(null);

  useEffect(() => {
    if (!enabled || !deviceId) {
      setAnalyser(null);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: false,
        });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const node = ctx.createAnalyser();
        node.fftSize = 512;
        node.smoothingTimeConstant = 0.3;
        source.connect(node);
        coreRef.current = { stream, ctx, source, analyser: node };
        setAnalyser(node);
      } catch (err) {
        console.warn("[useMicAnalyser] getUserMedia failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      setAnalyser(null);
      const pb = playbackRef.current;
      playbackRef.current = null;
      const core = coreRef.current;
      coreRef.current = null;
      try {
        pb?.audio.pause();
        pb?.gain.disconnect();
        pb?.dest.disconnect();
        core?.source.disconnect();
        core?.analyser.disconnect();
      } catch {
        // Ignore disconnect errors during teardown.
      }
      if (core) {
        for (const track of core.stream.getTracks()) track.stop();
        void core.ctx.close();
      }
    };
  }, [deviceId, enabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: analyser state is the trigger that coreRef finished acquiring; removing it deadlocks the playback effect on the first acquire
  useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    if (!playback) {
      playbackRef.current?.audio.pause();
      return;
    }
    if (!playbackRef.current) {
      const gain = core.ctx.createGain();
      gain.gain.value = 0.6;
      core.analyser.connect(gain);
      const dest = core.ctx.createMediaStreamDestination();
      gain.connect(dest);
      const audio = new Audio() as SinkAudio;
      audio.srcObject = dest.stream;
      playbackRef.current = { gain, dest, audio };
    }
    const pb = playbackRef.current;
    if (typeof pb.audio.setSinkId === "function" && speakerId) {
      pb.audio.setSinkId(speakerId).catch((err) => {
        console.warn("[useMicAnalyser] setSinkId failed:", err);
      });
    }
    if (core.ctx.state === "suspended") void core.ctx.resume();
    void pb.audio.play().catch((err) => {
      console.warn("[useMicAnalyser] play failed:", err);
    });
  }, [analyser, playback, speakerId]);

  return { analyser };
}

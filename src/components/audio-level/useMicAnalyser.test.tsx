import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMicAnalyser } from "@/components/audio-level/useMicAnalyser";

type FakeTrack = { stop: ReturnType<typeof vi.fn>; kind: string };

function makeFakeStream(): { stream: MediaStream; tracks: FakeTrack[] } {
  const tracks: FakeTrack[] = [{ stop: vi.fn(), kind: "audio" }];
  const stream = {
    getTracks: () => tracks,
    getAudioTracks: () => tracks,
  } as unknown as MediaStream;
  return { stream, tracks };
}

class FakeAnalyserNode {
  fftSize = 512;
  smoothingTimeConstant = 0.3;
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeGainNode {
  gain = { value: 1 };
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeSourceNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeDestinationNode {
  stream = { id: "fake-dest-stream" } as unknown as MediaStream;
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeAudioContext {
  state = "running";
  destination = {} as AudioDestinationNode;
  createAnalyser = vi.fn(() => new FakeAnalyserNode());
  createGain = vi.fn(() => new FakeGainNode());
  createMediaStreamSource = vi.fn(() => new FakeSourceNode());
  createMediaStreamDestination = vi.fn(() => new FakeDestinationNode());
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

type FakeAudio = {
  srcObject: MediaStream | null;
  setSinkId: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  paused: boolean;
};

let audioInstances: FakeAudio[];

beforeEach(() => {
  audioInstances = [];
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal(
    "Audio",
    class {
      srcObject: MediaStream | null = null;
      setSinkId = vi.fn().mockResolvedValue(undefined);
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      paused = true;
      constructor() {
        audioInstances.push(this as unknown as FakeAudio);
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubGetUserMedia(streamFactory: () => MediaStream) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn(async () => streamFactory()) },
  });
}

describe("useMicAnalyser", () => {
  it("does not acquire stream while playback is off", () => {
    stubGetUserMedia(() => makeFakeStream().stream);
    const { result } = renderHook(() => useMicAnalyser({ deviceId: "mic-1", playback: false, speakerId: null }));
    expect(result.current.analyser).toBeNull();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it("does not acquire stream when deviceId is null", () => {
    stubGetUserMedia(() => makeFakeStream().stream);
    const { result } = renderHook(() => useMicAnalyser({ deviceId: null, playback: true, speakerId: null }));
    expect(result.current.analyser).toBeNull();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it("acquires stream, builds playback chain and exposes analyser when playback is on", async () => {
    const { stream } = makeFakeStream();
    stubGetUserMedia(() => stream);
    const { result } = renderHook(() => useMicAnalyser({ deviceId: "mic-1", playback: true, speakerId: "spk-1" }));
    await waitFor(() => expect(result.current.analyser).not.toBeNull());
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: { deviceId: { exact: "mic-1" } },
      video: false,
    });
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].setSinkId).toHaveBeenCalledWith("spk-1");
    expect(audioInstances[0].play).toHaveBeenCalled();
  });

  it("tears down stream and analyser when playback toggles off", async () => {
    const { stream, tracks } = makeFakeStream();
    stubGetUserMedia(() => stream);
    const { result, rerender } = renderHook(
      ({ playback }: { playback: boolean }) => useMicAnalyser({ deviceId: "mic-1", playback, speakerId: "spk-1" }),
      { initialProps: { playback: true } },
    );
    await waitFor(() => expect(result.current.analyser).not.toBeNull());
    act(() => rerender({ playback: false }));
    await waitFor(() => expect(result.current.analyser).toBeNull());
    expect(tracks[0].stop).toHaveBeenCalled();
  });

  it("rebuilds the chain when speakerId changes during playback", async () => {
    const { stream } = makeFakeStream();
    stubGetUserMedia(() => stream);
    const { rerender } = renderHook(
      ({ speakerId }: { speakerId: string }) => useMicAnalyser({ deviceId: "mic-1", playback: true, speakerId }),
      { initialProps: { speakerId: "spk-1" } },
    );
    await waitFor(() => expect(audioInstances.length).toBeGreaterThanOrEqual(1));
    act(() => rerender({ speakerId: "spk-2" }));
    await waitFor(() => expect(audioInstances.length).toBeGreaterThanOrEqual(2));
    expect(audioInstances[audioInstances.length - 1].setSinkId).toHaveBeenCalledWith("spk-2");
  });

  it("stops tracks and closes context on unmount", async () => {
    const fake = makeFakeStream();
    stubGetUserMedia(() => fake.stream);
    const { unmount } = renderHook(() => useMicAnalyser({ deviceId: "mic-1", playback: true, speakerId: null }));
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(fake.tracks[0].stop).toHaveBeenCalled());
  });
});

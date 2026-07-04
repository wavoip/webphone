import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CallStatus } from "@/middleware/store/slices/callSlice";
import { useReconnectingSound } from "./useReconnectingSound";

function makeSound() {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    currentTime: 0,
    onended: null as null | (() => void),
  };
}

type FakeSound = ReturnType<typeof makeSound>;
const asAudio = (s: FakeSound) => s as unknown as HTMLAudioElement;

describe("useReconnectingSound", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays the tone and arms the loop while DISCONNECTED", () => {
    const sound = makeSound();
    renderHook(({ status }) => useReconnectingSound(status, asAudio(sound)), {
      initialProps: { status: "DISCONNECTED" as CallStatus },
    });

    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(typeof sound.onended).toBe("function");
  });

  it("replays 3s after the tone ends while still DISCONNECTED", () => {
    const sound = makeSound();
    renderHook(() => useReconnectingSound("DISCONNECTED", asAudio(sound)));

    act(() => sound.onended?.());
    expect(sound.play).toHaveBeenCalledTimes(1); // not yet — scheduled
    act(() => vi.advanceTimersByTime(3000));

    expect(sound.play).toHaveBeenCalledTimes(2);
  });

  it("cancels a pending replay when the call recovers (ACTIVE) — no stray tone", () => {
    const sound = makeSound();
    const { rerender } = renderHook(({ status }) => useReconnectingSound(status, asAudio(sound)), {
      initialProps: { status: "DISCONNECTED" as CallStatus },
    });

    // Tone ended → 3s replay scheduled, then the call recovers mid-gap.
    act(() => sound.onended?.());
    rerender({ status: "ACTIVE" as CallStatus });
    sound.play.mockClear();
    act(() => vi.advanceTimersByTime(3000));

    expect(sound.play).not.toHaveBeenCalled();
    expect(sound.pause).toHaveBeenCalled();
  });

  it("cancels a pending replay when the call ends (ENDED) mid-gap", () => {
    const sound = makeSound();
    const { rerender } = renderHook(({ status }) => useReconnectingSound(status, asAudio(sound)), {
      initialProps: { status: "DISCONNECTED" as CallStatus },
    });

    act(() => sound.onended?.());
    rerender({ status: "ENDED" as CallStatus });
    sound.play.mockClear();
    act(() => vi.advanceTimersByTime(3000));

    expect(sound.play).not.toHaveBeenCalled();
  });

  it("cancels a pending replay on unmount", () => {
    const sound = makeSound();
    const { unmount } = renderHook(() => useReconnectingSound("DISCONNECTED", asAudio(sound)));

    act(() => sound.onended?.());
    unmount();
    sound.play.mockClear();
    act(() => vi.advanceTimersByTime(3000));

    expect(sound.play).not.toHaveBeenCalled();
  });
});

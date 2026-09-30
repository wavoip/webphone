import { createRoot, createSignal } from "solid-js";
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

/**
 * O hook recebe um acessor, então "mudar de status" é mexer no sinal — não há render
 * para repetir. O `createRoot` é o dono dos efeitos, e o `dispose` é o desmontar.
 */
function montar(sound: FakeSound, inicial: CallStatus) {
  return createRoot((dispose) => {
    const [status, setStatus] = createSignal<CallStatus>(inicial);
    useReconnectingSound(status, asAudio(sound));
    return { setStatus, dispose };
  });
}

describe("useReconnectingSound", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays the tone and arms the loop while DISCONNECTED", () => {
    const sound = makeSound();
    const { dispose } = montar(sound, "DISCONNECTED");

    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(typeof sound.onended).toBe("function");
    dispose();
  });

  it("replays 3s after the tone ends while still DISCONNECTED", () => {
    const sound = makeSound();
    const { dispose } = montar(sound, "DISCONNECTED");

    sound.onended?.();
    expect(sound.play).toHaveBeenCalledTimes(1); // ainda não — só agendado
    vi.advanceTimersByTime(3000);

    expect(sound.play).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("cancels a pending replay when the call recovers (ACTIVE) — no stray tone", () => {
    const sound = makeSound();
    const { setStatus, dispose } = montar(sound, "DISCONNECTED");

    // O tom acabou → repetição em 3s, e a chamada volta no meio do intervalo.
    sound.onended?.();
    setStatus("ACTIVE");
    sound.play.mockClear();
    vi.advanceTimersByTime(3000);

    expect(sound.play).not.toHaveBeenCalled();
    expect(sound.pause).toHaveBeenCalled();
    dispose();
  });

  it("cancels a pending replay when the call ends (ENDED) mid-gap", () => {
    const sound = makeSound();
    const { setStatus, dispose } = montar(sound, "DISCONNECTED");

    sound.onended?.();
    setStatus("ENDED");
    sound.play.mockClear();
    vi.advanceTimersByTime(3000);

    expect(sound.play).not.toHaveBeenCalled();
    dispose();
  });

  it("cancels a pending replay on unmount", () => {
    const sound = makeSound();
    const { dispose } = montar(sound, "DISCONNECTED");

    sound.onended?.();
    dispose();
    sound.play.mockClear();
    vi.advanceTimersByTime(3000);

    expect(sound.play).not.toHaveBeenCalled();
  });
});

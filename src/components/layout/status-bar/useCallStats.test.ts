import { act, renderHook } from "@testing-library/react";
import type { CallStats } from "@wavoip/wavoip-api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCallStats } from "@/components/layout/status-bar/useCallStats";
import { FakeCallActive } from "@/middleware/testing/FakeWavoip";

function statsWithRtt(avg: number): CallStats {
  return {
    rtt: { min: avg, max: avg, avg },
    tx: { total: 0, total_bytes: 0, loss: 0, bitrate_kbps: 0, audio_level: 0 },
    rx: { total: 0, total_bytes: 0, loss: 0, bitrate_kbps: 0, audio_level: 0, jitter_ms: 0 },
    audio_context: { output_latency_ms: 0 },
  };
}

class FakeStatsCall extends FakeCallActive {
  pulls = 0;
  pending: ((s: CallStats) => void) | null = null;
  failNext = false;

  getStats = (): Promise<CallStats> => {
    this.pulls++;
    if (this.failNext) {
      this.failNext = false;
      return Promise.reject(new Error("transport down"));
    }
    return new Promise((resolve) => {
      this.pending = resolve;
    });
  };

  async settle(avg: number) {
    const resolve = this.pending;
    this.pending = null;
    await act(async () => resolve?.(statsWithRtt(avg)));
  }
}

describe("useCallStats", () => {
  let call: FakeStatsCall;

  beforeEach(() => {
    vi.useFakeTimers();
    call = new FakeStatsCall("call-1", "token-1");
  });

  afterEach(() => vi.useRealTimers());

  it("returns the latest snapshot after each pull", async () => {
    const { result } = renderHook(() => useCallStats(call, 100));
    expect(result.current).toBeNull();
    await call.settle(42);
    expect(result.current?.rtt.avg).toBe(42);
  });

  it("does not start a new pull while the previous one is pending", async () => {
    renderHook(() => useCallStats(call, 100));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(call.pulls).toBe(1);
    await call.settle(10);
    await act(async () => vi.advanceTimersByTime(100));
    expect(call.pulls).toBe(2);
  });

  it("keeps the last snapshot and keeps polling when a pull fails", async () => {
    const { result } = renderHook(() => useCallStats(call, 100));
    await call.settle(10);
    call.failNext = true;
    await act(async () => vi.advanceTimersByTime(100));
    expect(result.current?.rtt.avg).toBe(10);
    await act(async () => vi.advanceTimersByTime(100));
    expect(call.pulls).toBe(3);
  });

  it("does not poll while disabled", async () => {
    renderHook(() => useCallStats(call, 100, false));
    await act(async () => vi.advanceTimersByTime(1000));
    expect(call.pulls).toBe(0);
  });

  it("stops polling after unmount", async () => {
    const { unmount } = renderHook(() => useCallStats(call, 100));
    await call.settle(10);
    unmount();
    await act(async () => vi.advanceTimersByTime(1000));
    expect(call.pulls).toBe(1);
  });
});

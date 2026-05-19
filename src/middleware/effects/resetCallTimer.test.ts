import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetCallTimerEffect } from "@/middleware/effects/resetCallTimer";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing } from "@/middleware/testing/FakeWavoip";

describe("resetCallTimerEffect", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    vi.useFakeTimers();
    store = createMiddlewareStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not reset until 3s after a terminal status", () => {
    const unsub = resetCallTimerEffect({ store });
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok"));
    store.getState().setCallStatus("ended");

    vi.advanceTimersByTime(2999);
    expect(store.getState().outgoing).toBeDefined();

    vi.advanceTimersByTime(1);
    expect(store.getState().outgoing).toBeUndefined();
    expect(store.getState().callStatus).toBe("idle");
    unsub();
  });

  it("ignores non-terminal status changes", () => {
    const unsub = resetCallTimerEffect({ store });
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok"));
    store.getState().setCallStatus("calling");

    vi.advanceTimersByTime(5000);
    expect(store.getState().outgoing).toBeDefined();
    expect(store.getState().callStatus).toBe("calling");
    unsub();
  });

  it("clears active and peerMuted after terminal", () => {
    const unsub = resetCallTimerEffect({ store });
    store.getState().setActive(new FakeCallActive("c1", "tok"));
    store.getState().setPeerMuted(true);
    store.getState().setCallStatus("failed");

    vi.advanceTimersByTime(3000);
    expect(store.getState().active).toBeUndefined();
    expect(store.getState().peerMuted).toBe(false);
    unsub();
  });

  it.each(["ended", "failed", "rejected", "unanswered"] as const)("treats %s as terminal", (status) => {
    const unsub = resetCallTimerEffect({ store });
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok"));
    store.getState().setCallStatus(status);
    vi.advanceTimersByTime(3000);
    expect(store.getState().callStatus).toBe("idle");
    unsub();
  });

  it("unsub cancels pending timer", () => {
    const unsub = resetCallTimerEffect({ store });
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok"));
    store.getState().setCallStatus("ended");
    unsub();

    vi.advanceTimersByTime(3000);
    expect(store.getState().outgoing).toBeDefined();
  });
});

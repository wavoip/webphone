import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "@/middleware/events/EventBus";
import type { WebphoneEventMap } from "@/middleware/events/eventTypes";
import { callLifecycleEventsEffect } from "@/middleware/effects/callLifecycleEvents";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing } from "@/middleware/testing/FakeWavoip";

describe("callLifecycleEventsEffect", () => {
  let store: MiddlewareStoreApi;
  let events: EventBus<WebphoneEventMap>;
  let unsub: () => void;

  beforeEach(() => {
    store = createMiddlewareStore();
    events = new EventBus<WebphoneEventMap>();
    unsub = callLifecycleEventsEffect({ store, events });
  });

  it("emits call:started when an outgoing call appears", () => {
    const cb = vi.fn();
    events.on("call:started", cb);
    const outgoing = new FakeCallOutgoing("c1", "tok-1");
    store.getState().setOutgoing(outgoing);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].id).toBe("c1");
    unsub();
  });

  it("does not re-emit call:started when outgoing stays the same id", () => {
    const cb = vi.fn();
    events.on("call:started", cb);
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("emits call:accepted when an active call appears", () => {
    const cb = vi.fn();
    events.on("call:accepted", cb);
    store.getState().setActive(new FakeCallActive("c1", "tok-1"));
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    unsub();
  });

  it("emits call:ended when status enters a terminal state", () => {
    const cb = vi.fn();
    events.on("call:ended", cb);
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    store.getState().setCallStatus("ended");
    expect(cb).toHaveBeenCalledWith({ id: "c1", status: "ended" });
    unsub();
  });

  it("emits call:ended for every terminal status (failed/rejected/unanswered)", () => {
    const cb = vi.fn();
    events.on("call:ended", cb);
    store.getState().setOutgoing(new FakeCallOutgoing("c2", "tok-1"));
    store.getState().setCallStatus("failed");
    store.getState().resetCall();
    store.getState().setOutgoing(new FakeCallOutgoing("c3", "tok-1"));
    store.getState().setCallStatus("rejected");
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls.map((c) => c[0].status)).toEqual(["failed", "rejected"]);
    unsub();
  });

  it("returns an unsubscribe that stops further emissions", () => {
    const cb = vi.fn();
    events.on("call:started", cb);
    unsub();
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    expect(cb).not.toHaveBeenCalled();
  });
});

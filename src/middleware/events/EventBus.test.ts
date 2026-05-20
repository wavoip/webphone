import { describe, expect, it, vi } from "vitest";
import { EventBus } from "@/middleware/events/EventBus";

type TestEventMap = {
  ping: { n: number };
  pong: string;
};

describe("EventBus", () => {
  it("emits payloads to subscribers of the same event", () => {
    const bus = new EventBus<TestEventMap>();
    const cb = vi.fn();
    bus.on("ping", cb);
    bus.emit("ping", { n: 1 });
    expect(cb).toHaveBeenCalledWith({ n: 1 });
  });

  it("does not call subscribers of other events", () => {
    const bus = new EventBus<TestEventMap>();
    const cb = vi.fn();
    bus.on("ping", cb);
    bus.emit("pong", "hi");
    expect(cb).not.toHaveBeenCalled();
  });

  it("returns an unsubscribe function from on()", () => {
    const bus = new EventBus<TestEventMap>();
    const cb = vi.fn();
    const off = bus.on("ping", cb);
    off();
    bus.emit("ping", { n: 1 });
    expect(cb).not.toHaveBeenCalled();
  });

  it("supports multiple subscribers per event", () => {
    const bus = new EventBus<TestEventMap>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on("ping", a);
    bus.on("ping", b);
    bus.emit("ping", { n: 2 });
    expect(a).toHaveBeenCalledWith({ n: 2 });
    expect(b).toHaveBeenCalledWith({ n: 2 });
  });

  it("isolates one subscriber error so others still fire", () => {
    const bus = new EventBus<TestEventMap>();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    bus.on("ping", bad);
    bus.on("ping", good);
    bus.emit("ping", { n: 3 });
    expect(good).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("clear() drops every subscription", () => {
    const bus = new EventBus<TestEventMap>();
    const cb = vi.fn();
    bus.on("ping", cb);
    bus.clear();
    bus.emit("ping", { n: 1 });
    expect(cb).not.toHaveBeenCalled();
  });
});

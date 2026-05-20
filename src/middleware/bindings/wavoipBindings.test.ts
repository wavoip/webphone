import { beforeEach, describe, expect, it, vi } from "vitest";
import { bindWavoipEvents } from "@/middleware/bindings/wavoipBindings";
import { CallController } from "@/middleware/controllers/CallController";
import { EventBus } from "@/middleware/events/EventBus";
import type { WebphoneEventMap } from "@/middleware/events/eventTypes";
import { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("bindWavoipEvents", () => {
  let wavoip: FakeWavoip;
  let registry: MiddlewareRegistry;
  let store: MiddlewareStoreApi;
  let callController: CallController;
  let events: EventBus<WebphoneEventMap>;

  beforeEach(() => {
    wavoip = new FakeWavoip();
    registry = new MiddlewareRegistry();
    store = createMiddlewareStore();
    callController = new CallController({ wavoip: wavoip.asWavoip(), store });
    events = new EventBus<WebphoneEventMap>();
  });

  it("ingests an offer into the store when the pipeline reaches terminal", async () => {
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });
    const offer = new FakeOffer("o1", "tok-1");

    wavoip.emitEvent("offer", offer);
    await new Promise((r) => setTimeout(r, 0));

    expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
    unsub();
  });

  it("does not ingest when the pipeline blocks", async () => {
    registry.use("offer", () => {});
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });

    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));

    expect(store.getState().offers).toEqual([]);
    unsub();
  });

  it("forwards the offer payload to user middleware", async () => {
    const seen: string[] = [];
    registry.use("offer", (offer, next) => {
      seen.push(offer.id);
      next();
    });
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });

    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    wavoip.emitEvent("offer", new FakeOffer("o2", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));

    expect(seen).toEqual(["o1", "o2"]);
    expect(store.getState().offers.map((o) => o.id)).toEqual(["o1", "o2"]);
    unsub();
  });

  it("emits offer:received only when the pipeline reaches terminal", async () => {
    const cb = vi.fn();
    events.on("offer:received", cb);
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].id).toBe("o1");
    unsub();
  });

  it("does not emit offer:received when the pipeline blocks", async () => {
    const cb = vi.fn();
    events.on("offer:received", cb);
    registry.use("offer", () => {});
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(cb).not.toHaveBeenCalled();
    unsub();
  });

  it("unsub removes the wavoip offer listener", async () => {
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController, events });
    unsub();

    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));

    expect(store.getState().offers).toEqual([]);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { bindWavoipEvents } from "@/middleware/bindings/wavoipBindings";
import { CallController } from "@/middleware/controllers/CallController";
import { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("bindWavoipEvents", () => {
  let wavoip: FakeWavoip;
  let registry: MiddlewareRegistry;
  let store: MiddlewareStoreApi;
  let callController: CallController;

  beforeEach(() => {
    wavoip = new FakeWavoip();
    registry = new MiddlewareRegistry();
    store = createMiddlewareStore();
    callController = new CallController({ wavoip: wavoip.asWavoip(), store });
  });

  it("ingests an offer into the store when the pipeline reaches terminal", async () => {
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController });
    const offer = new FakeOffer("o1", "tok-1");

    wavoip.emitEvent("offer", offer);
    await new Promise((r) => setTimeout(r, 0));

    expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
    unsub();
  });

  it("does not ingest when the pipeline blocks", async () => {
    registry.use("offer", () => {});
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController });

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
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController });

    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    wavoip.emitEvent("offer", new FakeOffer("o2", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));

    expect(seen).toEqual(["o1", "o2"]);
    expect(store.getState().offers.map((o) => o.id)).toEqual(["o1", "o2"]);
    unsub();
  });

  it("unsub removes the wavoip offer listener", async () => {
    const unsub = bindWavoipEvents({ wavoip: wavoip.asWavoip(), registry, callController });
    unsub();

    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));

    expect(store.getState().offers).toEqual([]);
  });
});

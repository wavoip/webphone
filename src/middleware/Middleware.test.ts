import { beforeEach, describe, expect, it, vi } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("Middleware", () => {
  let wavoip: FakeWavoip;

  beforeEach(() => {
    wavoip = new FakeWavoip(["tok-1"]);
  });

  it("exposes store, registry, controllers and the underlying wavoip", () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() });
    expect(mw.store).toBeDefined();
    expect(mw.registry).toBeDefined();
    expect(mw.controllers.call).toBeDefined();
    expect(mw.controllers.device).toBeDefined();
    expect(mw.controllers.notifications).toBeDefined();
    expect(mw.wavoip).toBe(wavoip.asWavoip());
  });

  it("init() hydrates devices from wavoip.getDevices()", () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    expect(mw.store.getState().devices.map((d) => d.token)).toEqual(["tok-1"]);
  });

  it("init() hydrates notifications from localStorage", () => {
    localStorage.setItem(
      "webphone_notifications",
      JSON.stringify([
        {
          id: new Date(),
          type: "INFO",
          created_at: new Date(),
          message: "stored",
          detail: "",
          token: "tok-1",
          isHidden: false,
          isRead: false,
        },
      ]),
    );
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    expect(mw.store.getState().notifications).toHaveLength(1);
    expect(mw.store.getState().notifications[0].message).toBe("stored");
  });

  it("init() returns the middleware for chaining", () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() });
    expect(mw.init()).toBe(mw);
  });

  it("offer events emitted by wavoip flow into the store after init", async () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(mw.store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
  });

  it("registered offer middleware can block before the store sees it", async () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    mw.registry.use("offer", () => {});
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(mw.store.getState().offers).toEqual([]);
  });

  it("registered offer middleware can mutate then pass through", async () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    mw.registry.use("offer", (offer, next) => {
      offer.peer.displayName = "Renamed";
      next();
    });
    const offer = new FakeOffer("o1", "tok-1");
    wavoip.emitEvent("offer", offer);
    await new Promise((r) => setTimeout(r, 0));
    expect(mw.store.getState().offers[0].peer.displayName).toBe("Renamed");
  });

  it("destroy() stops further offer ingestion", async () => {
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    mw.destroy();
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(mw.store.getState().offers).toEqual([]);
  });

  it("destroy() removes beforeunload listener if a call was active", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const mw = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    mw.store.getState().setCallStatus("ACTIVE");
    mw.destroy();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    removeSpy.mockRestore();
  });
});

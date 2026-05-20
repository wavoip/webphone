import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetForTesting, setPublicApiBase, webphoneAPIPromise } from "@/lib/webphone-api/api";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import { FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("api.ts public surface", () => {
  beforeEach(() => {
    resetForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("setPublicApiBase resolves the webphoneAPIPromise with the base API", async () => {
    const wavoip = new FakeWavoip(["tok-1"]);
    const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    const base = buildPublicApi(middleware);

    setPublicApiBase(base);

    const resolved = await webphoneAPIPromise();
    expect(typeof resolved.call.start).toBe("function");
    expect(resolved.device.get().map((d) => d.token)).toEqual(["tok-1"]);
  });

  it("on() forwards to the underlying base events", async () => {
    const wavoip = new FakeWavoip(["tok-1"]);
    const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    setPublicApiBase(buildPublicApi(middleware));
    const api = await webphoneAPIPromise();
    const cb = vi.fn();
    const off = api.on("call:started", cb);
    middleware.events.emit("call:started", {
      id: "c1",
      type: "outgoing",
      status: "calling",
      device_token: "tok-1",
      direction: "outgoing",
      peer: { phone: "5511", displayName: null, profilePicture: null, muted: false },
    });
    expect(cb).toHaveBeenCalledTimes(1);
    off();
  });

  it("use() registers middleware on the underlying registry", async () => {
    const wavoip = new FakeWavoip(["tok-1"]);
    const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    setPublicApiBase(buildPublicApi(middleware));
    const api = await webphoneAPIPromise();
    const seen: string[] = [];
    api.use("offer", (offer, next) => {
      seen.push(offer.id);
      next();
    });
    wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
    await new Promise((r) => setTimeout(r, 0));
    expect(seen).toEqual(["o1"]);
  });

  it("subsequent setPublicApiBase calls are a no-op", async () => {
    const wavoip = new FakeWavoip(["tok-1"]);
    const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    const first = buildPublicApi(middleware);

    setPublicApiBase(first);
    const a = await webphoneAPIPromise();

    setPublicApiBase(buildPublicApi(new Middleware({ wavoip: wavoip.asWavoip() })));
    const b = await webphoneAPIPromise();
    expect(a).toBe(b);
  });
});

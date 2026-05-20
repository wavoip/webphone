import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetForTesting, setPublicApiBase, webphoneAPIPromise } from "@/lib/webphone-api/api";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";

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

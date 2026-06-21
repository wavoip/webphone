import type { Offer } from "@wavoip/wavoip-api";
import { describe, expect, it, vi } from "vitest";
import { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";

function makeOffer(id: string): Offer {
  return { id } as unknown as Offer;
}

describe("MiddlewareRegistry", () => {
  it("routes use('offer', fn) to the offer pipeline and runs it", async () => {
    const registry = new MiddlewareRegistry();
    const fn = vi.fn((_offer, next) => next());
    registry.use("offer", fn);

    const reached = await registry.run("offer", makeOffer("a"));
    expect(reached).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("a blocking offer middleware short-circuits run", async () => {
    const registry = new MiddlewareRegistry();
    registry.use("offer", (_offer, _next) => {});

    const reached = await registry.run("offer", makeOffer("a"));
    expect(reached).toBe(false);
  });

  it("runs offer middleware in registration order", async () => {
    const registry = new MiddlewareRegistry();
    const calls: string[] = [];
    registry.use("offer", (_o, next) => {
      calls.push("a");
      next();
    });
    registry.use("offer", (_o, next) => {
      calls.push("b");
      next();
    });

    await registry.run("offer", makeOffer("x"));
    expect(calls).toEqual(["a", "b"]);
  });

  it("use() with unknown event throws and lists supported events", () => {
    const registry = new MiddlewareRegistry();
    expect(() =>
      // @ts-expect-error testing runtime guard with an unsupported event name
      registry.use("nope", () => {}),
    ).toThrowError(/Unknown middleware event "nope".*Supported.*offer/);
  });

  it("run() with unknown event throws and lists supported events", async () => {
    const registry = new MiddlewareRegistry();
    await expect(
      // @ts-expect-error testing runtime guard with an unsupported event name
      registry.run("nope", makeOffer("a")),
    ).rejects.toThrowError(/Unknown middleware event "nope".*Supported.*offer/);
  });

  it("running offer with no registered middleware reaches terminal", async () => {
    const registry = new MiddlewareRegistry();
    expect(await registry.run("offer", makeOffer("x"))).toBe(true);
  });
});

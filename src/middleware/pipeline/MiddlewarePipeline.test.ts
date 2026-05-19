import { describe, expect, it, vi } from "vitest";
import { MiddlewarePipeline } from "@/middleware/pipeline/MiddlewarePipeline";

describe("MiddlewarePipeline", () => {
  it("empty chain runs as passthrough and reports terminal reached", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    expect(await pipeline.run("payload")).toBe(true);
  });

  it("single middleware that calls next reaches terminal", async () => {
    const pipeline = new MiddlewarePipeline<{ value: number }>();
    const fn = vi.fn((_payload, next) => next());
    pipeline.use(fn);

    expect(await pipeline.run({ value: 1 })).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual({ value: 1 });
  });

  it("middleware that omits next() blocks the chain", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    const fn = vi.fn(() => {});
    pipeline.use(fn);

    expect(await pipeline.run("payload")).toBe(false);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("runs multiple middleware in registration order", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    const calls: string[] = [];
    pipeline.use((_p, next) => {
      calls.push("a");
      next();
    });
    pipeline.use((_p, next) => {
      calls.push("b");
      next();
    });
    pipeline.use((_p, next) => {
      calls.push("c");
      next();
    });

    expect(await pipeline.run("x")).toBe(true);
    expect(calls).toEqual(["a", "b", "c"]);
  });

  it("blocking middleware stops downstream", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    const downstream = vi.fn((_p, next) => next());
    pipeline.use((_p, _next) => {
      // intentionally skip next()
    });
    pipeline.use(downstream);

    expect(await pipeline.run("x")).toBe(false);
    expect(downstream).not.toHaveBeenCalled();
  });

  it("awaits async middleware before advancing", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    const calls: string[] = [];
    pipeline.use(async (_p, next) => {
      await new Promise((r) => setTimeout(r, 5));
      calls.push("a");
      next();
    });
    pipeline.use((_p, next) => {
      calls.push("b");
      next();
    });

    expect(await pipeline.run("x")).toBe(true);
    expect(calls).toEqual(["a", "b"]);
  });

  it("throwing middleware rejects run with the same error", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    pipeline.use(() => {
      throw new Error("boom");
    });

    await expect(pipeline.run("x")).rejects.toThrow("boom");
  });

  it("calling next() twice in one middleware throws", async () => {
    const pipeline = new MiddlewarePipeline<string>();
    pipeline.use((_p, next) => {
      next();
      next();
    });

    await expect(pipeline.run("x")).rejects.toThrow(/next\(\) called multiple times/);
  });
});

import type { Middleware } from "@/middleware/pipeline/types";

/**
 * Express-style middleware chain.
 *
 * A middleware must call `next()` to pass control downstream. Omitting `next()`
 * blocks the chain — `run()` resolves to `false`. Calling `next()` more than
 * once in the same middleware is an error.
 */
export class MiddlewarePipeline<T> {
  private readonly chain: Middleware<T>[] = [];

  use(fn: Middleware<T>): void {
    this.chain.push(fn);
  }

  /** Returns `true` if the terminal end of the chain is reached, `false` if blocked. */
  async run(payload: T): Promise<boolean> {
    return this.execute(payload, 0);
  }

  private async execute(payload: T, index: number): Promise<boolean> {
    if (index >= this.chain.length) return true;

    const fn = this.chain[index];
    let nextCalled = false;
    let downstream: Promise<boolean> = Promise.resolve(false);

    await fn(payload, () => {
      if (nextCalled) {
        throw new Error(`next() called multiple times in middleware at index ${index}`);
      }
      nextCalled = true;
      downstream = this.execute(payload, index + 1);
    });

    return nextCalled ? downstream : false;
  }
}

import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";

let base: WebphoneAPI | null = null;
let pending = createPending();

const warnedDeprecated = new Set<string>();

/**
 * Emits a console.warn the first time a deprecated public API method is invoked.
 * Subsequent calls for the same method are silent to avoid log spam.
 */
export function warnDeprecated(method: string, replacement: string): void {
  if (warnedDeprecated.has(method)) return;
  warnedDeprecated.add(method);
  console.warn(
    `[wavoip-webphone] \`${method}\` is deprecated and will be removed in a future major release. Use \`${replacement}\` instead.`,
  );
}

/**
 * Returns the shared promise that resolves once {@link setPublicApiBase} is
 * called with a base API instance. Always returns the same promise so callers
 * can subscribe before the base is installed.
 */
export function webphoneAPIPromise(): Promise<WebphoneAPI> {
  return pending.promise;
}

/**
 * Installs the base WebphoneAPI built from the Middleware. First call resolves
 * {@link webphoneAPIPromise}; subsequent calls are no-ops so an already-resolved
 * window.wavoip is never replaced mid-flight.
 */
export function setPublicApiBase(api: WebphoneAPI): void {
  if (base) return;
  base = api;
  pending.resolve(api);
}

/**
 * Test-only helper: clears base, deprecation warnings and the pending promise
 * so each test starts from a clean slate.
 */
export function resetForTesting(): void {
  base = null;
  warnedDeprecated.clear();
  pending = createPending();
}

type Pending = { promise: Promise<WebphoneAPI>; resolve: (api: WebphoneAPI) => void };

function createPending(): Pending {
  let resolve!: (api: WebphoneAPI) => void;
  const promise = new Promise<WebphoneAPI>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

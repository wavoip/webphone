import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";

let base: WebphoneAPI | null = null;
let pending = createPending();

const warnedDeprecated = new Set<string>();

export function warnDeprecated(method: string, replacement: string): void {
  if (warnedDeprecated.has(method)) return;
  warnedDeprecated.add(method);
  console.warn(
    `[wavoip-webphone] \`${method}\` is deprecated and will be removed in a future major release. Use \`${replacement}\` instead.`,
  );
}

/** Sempre a mesma promise, para quem chama poder esperar antes de a base existir. */
export function webphoneAPIPromise(): Promise<WebphoneAPI> {
  return pending.promise;
}

/** Só a primeira chamada vale, para um window.wavoip já entregue nunca ser trocado no meio. */
export function setPublicApiBase(api: WebphoneAPI): void {
  if (base) return;
  base = api;
  pending.resolve(api);
}

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

import { bus } from "@/lib/webphone-api/bus";
import type { Wavoip } from "@/lib/webphone-api/sdk-types";

/**
 * Wires the wavoip-api SDK instance into the bus.
 *
 * Each domain adapter (call, device, …) registers its event listeners,
 * request handlers, and query getters here. Once all adapters are wired,
 * `acl.ready` fires so the public facade can resolve `webphoneAPIPromise`.
 *
 * Adapter registration is added in subsequent PRs.
 */
export function bootACL(_wavoip: Wavoip): () => void {
  // Adapters slot in here as slices migrate (PR3 onward).

  bus.emit("acl.ready", undefined);

  return () => {
    bus.reset();
  };
}

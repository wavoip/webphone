import type { Wavoip } from "@wavoip/wavoip-api";
import type { CallController } from "@/middleware/controllers/CallController";
import type { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";

type Deps = {
  wavoip: Wavoip;
  registry: MiddlewareRegistry;
  callController: CallController;
};

export type Unsubscribe = () => void;

export function bindWavoipEvents({ wavoip, registry, callController }: Deps): Unsubscribe {
  const unsub = wavoip.on("offer", async (offer) => {
    const reached = await registry.run("offer", offer);
    if (reached) callController.ingestOffer(offer);
  });
  return () => unsub?.();
}

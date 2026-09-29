import type { IncomingCall, Wavoip } from "@wavoip/wavoip-api/web";
import type { CallController } from "@/middleware/controllers/CallController";
import type { EventBus } from "@/middleware/events/EventBus";
import type { WebphoneEventMap } from "@/middleware/events/eventTypes";
import type { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";

type Deps = {
  wavoip: Wavoip;
  registry: MiddlewareRegistry;
  callController: CallController;
  events: EventBus<WebphoneEventMap>;
};

export type Unsubscribe = () => void;

export function bindWavoipEvents({ wavoip, registry, callController, events }: Deps): Unsubscribe {
  const unsub = wavoip.on("offer", async (offer) => {
    const reached = await registry.run("offer", offer);
    if (!reached) return;
    callController.ingestOffer(offer);
    events.emit("offer:received", projectOffer(offer));
  });
  return () => unsub?.();
}

function projectOffer(offer: IncomingCall) {
  const { id, type, status, deviceToken, direction, peer } = offer;
  return { id, type, status, device_token: deviceToken, direction, peer };
}

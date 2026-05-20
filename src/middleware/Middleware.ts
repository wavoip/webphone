import type { Wavoip } from "@wavoip/wavoip-api";
import { bindWavoipEvents } from "@/middleware/bindings/wavoipBindings";
import { CallController } from "@/middleware/controllers/CallController";
import { DeviceController } from "@/middleware/controllers/DeviceController";
import { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { beforeUnloadEffect } from "@/middleware/effects/beforeUnload";
import { callLifecycleEventsEffect } from "@/middleware/effects/callLifecycleEvents";
import { persistDevicesEffect } from "@/middleware/effects/persistDevices";
import { resetCallTimerEffect } from "@/middleware/effects/resetCallTimer";
import { ringtoneEffect, type RingtonePlayer } from "@/middleware/effects/ringtone";
import { EventBus } from "@/middleware/events/EventBus";
import type { WebphoneEventMap } from "@/middleware/events/eventTypes";
import { MiddlewareRegistry } from "@/middleware/pipeline/MiddlewareRegistry";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

type Controllers = {
  call: CallController;
  device: DeviceController;
  notifications: NotificationsController;
};

const NOOP_PLAYER: RingtonePlayer = { start: () => {}, stop: () => {} };

export type MiddlewareDeps = {
  wavoip: Wavoip;
  ringtone?: RingtonePlayer;
  vibration?: RingtonePlayer;
};

/**
 * Orchestrates the middleware layer: wires the wavoip-api event stream,
 * registry, controllers, store, and browser side-effects. Consumers (React UI
 * or programmatic users) read state from `store` and invoke `controllers` or
 * `registry`. Call {@link init} to start, {@link destroy} to tear down.
 */
export class Middleware {
  readonly wavoip: Wavoip;
  readonly store: MiddlewareStoreApi;
  readonly registry: MiddlewareRegistry;
  readonly events: EventBus<WebphoneEventMap>;
  readonly controllers: Controllers;
  private readonly ringtone: RingtonePlayer;
  private readonly vibration: RingtonePlayer;
  private unsubs: Array<() => void> = [];
  private started = false;

  constructor(deps: MiddlewareDeps) {
    this.wavoip = deps.wavoip;
    this.ringtone = deps.ringtone ?? NOOP_PLAYER;
    this.vibration = deps.vibration ?? NOOP_PLAYER;
    this.store = createMiddlewareStore();
    this.registry = new MiddlewareRegistry();
    this.events = new EventBus<WebphoneEventMap>();
    this.controllers = {
      call: new CallController({ wavoip: this.wavoip, store: this.store }),
      device: new DeviceController({ wavoip: this.wavoip, store: this.store }),
      notifications: new NotificationsController({ store: this.store }),
    };
  }

  init(): this {
    if (this.started) return this;
    this.started = true;

    this.controllers.device.hydrate();
    this.controllers.notifications.hydrate();

    this.unsubs.push(
      bindWavoipEvents({
        wavoip: this.wavoip,
        registry: this.registry,
        callController: this.controllers.call,
        events: this.events,
      }),
      callLifecycleEventsEffect({ store: this.store, events: this.events }),
      persistDevicesEffect({ store: this.store }),
      resetCallTimerEffect({ store: this.store }),
      ringtoneEffect({ store: this.store, ringtone: this.ringtone, vibration: this.vibration }),
      beforeUnloadEffect({ store: this.store }),
    );

    return this;
  }

  destroy(): void {
    for (const unsub of this.unsubs) unsub();
    this.unsubs = [];
    this.events.clear();
    this.started = false;
  }
}

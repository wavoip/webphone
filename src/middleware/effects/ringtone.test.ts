import { beforeEach, describe, expect, it, vi } from "vitest";
import { ringtoneEffect, type RingtonePlayer } from "@/middleware/effects/ringtone";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeOffer } from "@/middleware/testing/FakeWavoip";

function makePlayer(): RingtonePlayer {
  return { start: vi.fn(), stop: vi.fn() };
}

describe("ringtoneEffect", () => {
  let store: MiddlewareStoreApi;
  let ringtone: RingtonePlayer;
  let vibration: RingtonePlayer;

  beforeEach(() => {
    store = createMiddlewareStore();
    ringtone = makePlayer();
    vibration = makePlayer();
  });

  it("starts ringtone + vibration when offers go from 0 to 1", () => {
    const unsub = ringtoneEffect({ store, ringtone, vibration });
    store.getState().addOffer(new FakeOffer("o1", "tok"));

    expect(ringtone.start).toHaveBeenCalledTimes(1);
    expect(vibration.start).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("does not restart when more offers arrive", () => {
    const unsub = ringtoneEffect({ store, ringtone, vibration });
    store.getState().addOffer(new FakeOffer("o1", "tok"));
    store.getState().addOffer(new FakeOffer("o2", "tok"));

    expect(ringtone.start).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("stops ringtone + vibration when all offers drain", () => {
    const unsub = ringtoneEffect({ store, ringtone, vibration });
    store.getState().addOffer(new FakeOffer("o1", "tok"));
    store.getState().removeOffer("o1");

    expect(ringtone.stop).toHaveBeenCalledTimes(1);
    expect(vibration.stop).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("does not stop while offers remain", () => {
    const unsub = ringtoneEffect({ store, ringtone, vibration });
    store.getState().addOffer(new FakeOffer("o1", "tok"));
    store.getState().addOffer(new FakeOffer("o2", "tok"));
    store.getState().removeOffer("o1");

    expect(ringtone.stop).not.toHaveBeenCalled();
    unsub();
  });

  it("unsub stops further reactions", () => {
    const unsub = ringtoneEffect({ store, ringtone, vibration });
    unsub();
    store.getState().addOffer(new FakeOffer("o1", "tok"));
    expect(ringtone.start).not.toHaveBeenCalled();
  });
});

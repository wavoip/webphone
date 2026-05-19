import type { CallActive, CallOutgoing, Offer } from "@wavoip/wavoip-api";
import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

function makeOffer(id: string): Offer {
  return { id, type: "OFFICIAL", direction: "INCOMING", status: "RINGING" } as unknown as Offer;
}

function makeOutgoing(id: string): CallOutgoing {
  return { id, type: "OFFICIAL", direction: "OUTGOING", status: "CALLING" } as unknown as CallOutgoing;
}

function makeActive(id: string): CallActive {
  return { id, type: "OFFICIAL", direction: "OUTGOING", status: "ACTIVE" } as unknown as CallActive;
}

describe("callSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts with empty call state", () => {
    const s = store.getState();
    expect(s.offers).toEqual([]);
    expect(s.outgoing).toBeUndefined();
    expect(s.active).toBeUndefined();
    expect(s.callStatus).toBe("idle");
    expect(s.peerMuted).toBe(false);
  });

  it("addOffer appends an offer", () => {
    store.getState().addOffer(makeOffer("a"));
    store.getState().addOffer(makeOffer("b"));
    expect(store.getState().offers.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("removeOffer drops the matching id and keeps others", () => {
    store.getState().addOffer(makeOffer("a"));
    store.getState().addOffer(makeOffer("b"));
    store.getState().removeOffer("a");
    expect(store.getState().offers.map((o) => o.id)).toEqual(["b"]);
  });

  it("removeOffer on unknown id is a no-op", () => {
    store.getState().addOffer(makeOffer("a"));
    store.getState().removeOffer("z");
    expect(store.getState().offers.map((o) => o.id)).toEqual(["a"]);
  });

  it("setOutgoing and clearing it", () => {
    store.getState().setOutgoing(makeOutgoing("o1"));
    expect(store.getState().outgoing?.id).toBe("o1");
    store.getState().setOutgoing(undefined);
    expect(store.getState().outgoing).toBeUndefined();
  });

  it("setActive and clearing it", () => {
    store.getState().setActive(makeActive("c1"));
    expect(store.getState().active?.id).toBe("c1");
    store.getState().setActive(undefined);
    expect(store.getState().active).toBeUndefined();
  });

  it("setCallStatus transitions", () => {
    store.getState().setCallStatus("calling");
    expect(store.getState().callStatus).toBe("calling");
    store.getState().setCallStatus("active");
    expect(store.getState().callStatus).toBe("active");
  });

  it("setPeerMuted toggles", () => {
    store.getState().setPeerMuted(true);
    expect(store.getState().peerMuted).toBe(true);
    store.getState().setPeerMuted(false);
    expect(store.getState().peerMuted).toBe(false);
  });

  it("resetCall returns to initial call state but keeps other slices", () => {
    store.getState().addOffer(makeOffer("a"));
    store.getState().setOutgoing(makeOutgoing("o"));
    store.getState().setActive(makeActive("c"));
    store.getState().setCallStatus("active");
    store.getState().setPeerMuted(true);

    store.getState().resetCall();

    const s = store.getState();
    expect(s.offers).toEqual([]);
    expect(s.outgoing).toBeUndefined();
    expect(s.active).toBeUndefined();
    expect(s.callStatus).toBe("idle");
    expect(s.peerMuted).toBe(false);
  });
});

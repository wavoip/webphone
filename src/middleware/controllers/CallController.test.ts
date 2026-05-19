import { beforeEach, describe, expect, it } from "vitest";
import { CallController } from "@/middleware/controllers/CallController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing, FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("CallController", () => {
  let store: MiddlewareStoreApi;
  let wavoip: FakeWavoip;
  let controller: CallController;

  beforeEach(() => {
    wavoip = new FakeWavoip(["tok-1"]);
    store = createMiddlewareStore();
    controller = new CallController({ wavoip: wavoip.asWavoip(), store });
  });

  describe("start", () => {
    it("returns the error from wavoip.startCall when it fails", async () => {
      wavoip.startCallResult = { call: null, err: { message: "no devices", devices: [] } };
      const result = await controller.start("5511");
      expect(result.err?.message).toBe("no devices");
      expect(store.getState().outgoing).toBeUndefined();
    });

    it("forwards explicit fromTokens to wavoip.startCall", async () => {
      wavoip.startCallResult = { call: new FakeCallOutgoing("c1", "tok-1"), err: null };
      await controller.start("5511", { fromTokens: ["tok-1"] });
      expect(wavoip.startCallCalls[0].fromTokens).toEqual(["tok-1"]);
    });

    it("derives fromTokens from enabled devices when not provided", async () => {
      wavoip.startCallResult = { call: new FakeCallOutgoing("c1", "tok-1"), err: null };
      store.getState().setDevices([
        { token: "tok-on", status: "open", enable: true, persist: false },
        { token: "tok-off", status: "open", enable: false, persist: false },
      ]);
      await controller.start("5511");
      expect(wavoip.startCallCalls[0].fromTokens).toEqual(["tok-on"]);
    });

    it("on success sets outgoing + callStatus 'calling'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      const result = await controller.start("5511");
      expect(result.err).toBeNull();
      expect(store.getState().outgoing?.id).toBe("c1");
      expect(store.getState().callStatus).toBe("calling");
    });

    it("returns a CallSummary with id + peer", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      const result = await controller.start("5511");
      if (result.err) throw new Error("expected success");
      expect(result.call.id).toBe("c1");
      expect(result.call.peer.phone).toBe(outgoing.peer.phone);
    });

    it("outgoing status RINGING updates callStatus to 'ringing'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("status", "RINGING");
      expect(store.getState().callStatus).toBe("ringing");
    });

    it("outgoing status FAILED transitions to 'failed'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("status", "FAILED");
      expect(store.getState().callStatus).toBe("failed");
    });

    it("peerAccept moves outgoing to active and sets status", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      expect(store.getState().active?.id).toBe("c1");
      expect(store.getState().outgoing).toBeUndefined();
      expect(store.getState().callStatus).toBe("active");
    });

    it("active call ended event sets status 'ended'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("ended");
      expect(store.getState().callStatus).toBe("ended");
    });

    it("active peerMute / peerUnmute toggles peerMuted", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("peerMute");
      expect(store.getState().peerMuted).toBe(true);
      active.emitEvent("peerUnmute");
      expect(store.getState().peerMuted).toBe(false);
    });

    it("active status DISCONNECTED → 'reconnecting'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("status", "DISCONNECTED");
      expect(store.getState().callStatus).toBe("reconnecting");
    });

    it("outgoing peerReject → 'rejected'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerReject");
      expect(store.getState().callStatus).toBe("rejected");
    });

    it("outgoing unanswered → 'unanswered'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("unanswered");
      expect(store.getState().callStatus).toBe("unanswered");
    });
  });

  describe("ingestOffer", () => {
    it("adds the offer to store", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
    });

    it("offer ended event removes it", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("ended");
      expect(store.getState().offers).toEqual([]);
    });

    it("offer acceptedElsewhere event removes it", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("acceptedElsewhere");
      expect(store.getState().offers).toEqual([]);
    });

    it("accept() on a stored offer transitions to active call", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      const active = new FakeCallActive("o1", "tok-1");
      offer.acceptResult = { call: active, err: null };
      controller.ingestOffer(offer);

      const [stored] = store.getState().offers;
      const result = await stored.accept();
      expect(result.err).toBeNull();
      expect(store.getState().active?.id).toBe("o1");
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().callStatus).toBe("active");
    });

    it("accept() with err leaves offer in place and does not promote to active", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      offer.acceptResult = { call: null, err: "boom" };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.accept();
      expect(result.err).toBe("boom");
      expect(store.getState().active).toBeUndefined();
    });
  });
});

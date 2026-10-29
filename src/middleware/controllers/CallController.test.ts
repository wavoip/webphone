import { beforeEach, describe, expect, it } from "vitest";
import { CallController } from "@/middleware/controllers/CallController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing, FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

/**
 * Lets fire-and-forget (`void`) controller work settle before asserting, so a
 * test cannot pass merely because the write landed after the expectation.
 */
const flushMicrotasks = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

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
        {
          token: "tok-on",
          status: "open",
          restricted: false,
          restrictedUntil: null,
          connectionStatus: "connected",
          enable: true,
          persist: false,
        },
        {
          token: "tok-off",
          status: "open",
          restricted: false,
          restrictedUntil: null,
          connectionStatus: "connected",
          enable: false,
          persist: false,
        },
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
      expect(store.getState().callStatus).toBe("CALLING");
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
      expect(store.getState().callStatus).toBe("RINGING");
    });

    it("outgoing status FAILED transitions to 'failed'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("status", "FAILED");
      expect(store.getState().callStatus).toBe("FAILED");
    });

    it("peerAccept moves outgoing to active and sets status", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      expect(store.getState().active?.id).toBe("c1");
      expect(store.getState().outgoing).toBeUndefined();
      expect(store.getState().callStatus).toBe("ACTIVE");
    });

    it("active call ended event sets status 'ended'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("ended");
      expect(store.getState().callStatus).toBe("ENDED");
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

    it("active error event captures fail reason in store", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("error", "PEER_NETWORK_LOST");
      expect(store.getState().callFailReason).toBe("PEER_NETWORK_LOST");
    });

    it("start clears any stale callFailReason from a prior call", async () => {
      store.getState().setCallFailReason("OLD_REASON");
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      expect(store.getState().callFailReason).toBeUndefined();
    });

    it("active status DISCONNECTED → 'reconnecting'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      active.emitEvent("status", "DISCONNECTED");
      expect(store.getState().callStatus).toBe("DISCONNECTED");
    });

    it("active status ENDED does not clobber a prior 'ended' state", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerAccept", active);
      store.getState().setCallStatus("ENDED");
      active.emitEvent("status", "ENDED");
      expect(store.getState().callStatus).toBe("ENDED");
    });

    it("outgoing peerReject → 'rejected'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("peerReject");
      expect(store.getState().callStatus).toBe("REJECTED");
    });

    it("outgoing unanswered → 'unanswered'", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.emitEvent("unanswered");
      expect(store.getState().callStatus).toBe("NOT_ANSWERED");
    });
  });

  describe("end", () => {
    it("flips callStatus to 'ended' immediately on active end", async () => {
      const active = new FakeCallActive("c1", "tok-1");
      store.getState().setActive(active);
      store.getState().setCallStatus("ACTIVE");
      await controller.end();
      expect(store.getState().callStatus).toBe("ENDED");
    });

    it("delegates to cancel() when only an outgoing call is in flight", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("CALLING");
      await controller.end();
      expect(outgoing.cancelCalls).toBe(1);
      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("no-ops when no call is in flight", async () => {
      const before = store.getState().callStatus;
      const result = await controller.end();
      expect(result.err).toBeNull();
      expect(store.getState().callStatus).toBe(before);
    });
  });

  describe("cancel", () => {
    it("flips callStatus to CANCELLED once the server confirms", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");

      const result = await controller.cancel();

      expect(result.err).toBeNull();
      expect(outgoing.cancelCalls).toBe(1);
      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("clears micMuted once the server confirms the cancel", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      store.getState().setOutgoing(outgoing);
      store.getState().setMicMuted(true);

      await controller.cancel();

      expect(store.getState().micMuted).toBe(false);
    });

    it("hands the refusal back to the caller", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      outgoing.cancelResult = { err: "IS_NOT_OFFER" };
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");

      const result = await controller.cancel();

      expect(result.err).toBe("IS_NOT_OFFER");
    });

    // Se o peer atende durante o await, o status já andou sozinho; desfazer às cegas o
    // arrastaria para RINGING e prenderia a tela em "Chamando...".
    it("does not clobber a status the server moved on during the await", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      outgoing.cancelResult = { err: "IS_NOT_OFFER" };
      outgoing.cancel = async () => {
        store.getState().setCallStatus("ACTIVE");
        return outgoing.cancelResult;
      };
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");

      await controller.cancel();

      expect(store.getState().callStatus).toBe("ACTIVE");
    });

    it("does not mark the call terminal until the server confirms", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      outgoing.cancelResult = { err: "IS_NOT_OFFER" };
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");
      const seen: string[] = [];
      const unsub = store.subscribe(
        (s) => s.callStatus,
        (status) => seen.push(status),
      );

      await controller.cancel();

      expect(seen).not.toContain("CANCELLED");
      expect(store.getState().callStatus).toBe("RINGING");
      unsub();
    });

    it("no-ops when there is no outgoing call", async () => {
      const before = store.getState().callStatus;

      const result = await controller.cancel();

      expect(result.err).toBeNull();
      expect(store.getState().callStatus).toBe(before);
    });
  });

  describe("outgoing terminal status", () => {
    it("keeps CANCELLED when the SDK reports a cancelled ending", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");

      outgoing.emitEvent("status", "CANCELLED");
      outgoing.emitEvent("ended");

      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("still reports an ordinary hangup as ENDED", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");

      outgoing.emitEvent("status", "ENDED");
      outgoing.emitEvent("ended");

      expect(store.getState().callStatus).toBe("ENDED");
    });
  });

  describe("setMicMuted", () => {
    it("records the mute in the store so remounting CallButtons cannot lose it", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");

      await controller.setMicMuted(true);

      expect(store.getState().micMuted).toBe(true);
    });

    // Regression: muting while ringing left the mic silent for the whole call.
    // The SDK keeps mute across the transition, so the store must too —
    // CallButtons is remounted here (outgoing screen → call screen).
    it("keeps micMuted across the outgoing→active transition", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      await controller.setMicMuted(true);

      outgoing.emitEvent("peerAccept", new FakeCallActive("c1", "tok-1"));
      await flushMicrotasks();

      expect(store.getState().micMuted).toBe(true);
    });

    it("unmutes the active call once it took over from the outgoing one", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      await controller.setMicMuted(true);
      outgoing.emitEvent("peerAccept", active);
      await flushMicrotasks();

      await controller.setMicMuted(false);

      // Muted on the active call by the rebase, then unmuted by the user.
      expect(active.microphone.calls).toEqual([true, false]);
      expect(store.getState().micMuted).toBe(false);
    });

    // Mic operations share one MediaManager, so they must not interleave: the
    // user tapping "Falar" mid-rebase has to win, not be undone by it.
    it("lets an unmute issued during the rebase land last", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      await controller.setMicMuted(true);

      outgoing.emitEvent("peerAccept", active);
      await controller.setMicMuted(false);
      await flushMicrotasks();

      expect(active.microphone.calls.at(-1)).toBe(false);
      expect(store.getState().micMuted).toBe(false);
    });

    it("leaves micMuted untouched when the SDK reports an error", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      outgoing.microphone.result = { err: "socket down" };

      const result = await controller.setMicMuted(true);

      expect(result.err).toBe("socket down");
      expect(store.getState().micMuted).toBe(false);
    });

    it("no-ops when no call is in flight", async () => {
      const result = await controller.setMicMuted(true);
      expect(result.err).toBeNull();
      expect(store.getState().micMuted).toBe(false);
    });

    // Regression: CallOutgoing.mute() sets a server-side flag that
    // CallActive.unmute() cannot clear, so a call muted while ringing stayed
    // silent even after the UI showed an open mic.
    it("clears the server-side mute and re-mutes locally when the peer answers", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");
      await controller.setMicMuted(true);

      outgoing.emitEvent("peerAccept", active);
      await flushMicrotasks();

      expect(outgoing.microphone.calls).toEqual([false, true, false]);
      expect(active.microphone.calls).toEqual([true]);
      expect(store.getState().micMuted).toBe(true);
    });

    it("leaves the outgoing call alone when the peer answers an unmuted call", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      await controller.start("5511");

      outgoing.emitEvent("peerAccept", active);
      await flushMicrotasks();

      expect(active.microphone.calls).toEqual([]);
      expect(store.getState().micMuted).toBe(false);
    });
  });

  describe("mic reset between calls", () => {
    // MediaManager.muted survives stopMedia(), so a call that ended muted would
    // leave the next one silent while the UI showed an open mic.
    it("unmutes the SDK when an outgoing call starts", async () => {
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      store.getState().setMicMuted(true);

      await controller.start("5511");

      expect(outgoing.microphone.calls).toEqual([false]);
      expect(store.getState().micMuted).toBe(false);
    });

    it("unmutes the SDK when an incoming offer is accepted", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      const active = new FakeCallActive("c1", "tok-1");
      offer.acceptResult = { call: active, err: null };
      store.getState().setMicMuted(true);
      controller.ingestOffer(offer);

      await store.getState().offers[0].accept();
      await flushMicrotasks();

      expect(active.microphone.calls).toEqual([false]);
      expect(store.getState().micMuted).toBe(false);
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
      expect(store.getState().callStatus).toBe("ACTIVE");
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

    it("reject() removes the offer and marks outcome 'rejected'", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      offer.rejectResult = { err: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.reject();
      expect(result.err).toBeNull();
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().lastOfferOutcomes.o1).toBe("rejected");
    });

    it("reject() with err leaves the offer in place and does not mark outcome", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      offer.rejectResult = { err: "boom" };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.reject();
      expect(result.err).toBe("boom");
      expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("accept() marks outcome 'accepted' on the promoted offer", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      const active = new FakeCallActive("o1", "tok-1");
      offer.acceptResult = { call: active, err: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      await stored.accept();
      expect(store.getState().lastOfferOutcomes.o1).toBe("accepted");
    });

    it("acceptedElsewhere marks outcome 'elsewhere'", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("acceptedElsewhere");
      expect(store.getState().lastOfferOutcomes.o1).toBe("elsewhere");
    });

    it("rejectedElsewhere marks outcome 'elsewhere'", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("rejectedElsewhere");
      expect(store.getState().lastOfferOutcomes.o1).toBe("elsewhere");
    });

    it("ended does not mark an outcome (counts as missed downstream)", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("ended");
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("unanswered does not mark an outcome (counts as missed downstream)", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("unanswered");
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("ignore() removes the offer and does not mark an outcome (counts as missed downstream, like a real phone's 'ignore')", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      stored.ignore();
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("ignore() does not touch an offer that already left the store via accept()", async () => {
      const offer = new FakeOffer("o1", "tok-1");
      const active = new FakeCallActive("o1", "tok-1");
      offer.acceptResult = { call: active, err: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      await stored.accept();

      stored.ignore();

      expect(store.getState().active?.id).toBe("o1");
      expect(store.getState().lastOfferOutcomes.o1).toBe("accepted");
    });

    it("ignore() is a no-op when called twice in a row", () => {
      const offer = new FakeOffer("o1", "tok-1");
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      stored.ignore();
      expect(() => stored.ignore()).not.toThrow();
      expect(store.getState().offers).toEqual([]);
    });
  });
});

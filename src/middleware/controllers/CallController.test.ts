import { beforeEach, describe, expect, it } from "vitest";
import { NotificationsController } from "@/middleware/controllers/NotificationsController";
import { CallController } from "@/middleware/controllers/CallController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeActiveCall, FakeIncomingCall, FakeOutgoingCall, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("CallController", () => {
  let store: MiddlewareStoreApi;
  let wavoip: FakeWavoip;
  let controller: CallController;
  let notifications: NotificationsController;

  beforeEach(() => {
    wavoip = new FakeWavoip(["tok-1"]);
    store = createMiddlewareStore();
    notifications = new NotificationsController({ store });
    controller = new CallController({ wavoip: wavoip.asWavoip(), store, notifications });
  });

  describe("start", () => {
    it("returns the error from wavoip.startCall when it fails", async () => {
      wavoip.startCallResult = { data: null, error: { code: "NO_DEVICES", devices: [] } };
      const result = await controller.start("5511");
      expect(result.err?.message).toBe("NO_DEVICES");
      expect(store.getState().outgoing).toBeUndefined();
    });

    it("forwards explicit fromTokens to wavoip.startCall", async () => {
      wavoip.startCallResult = { data: new FakeOutgoingCall("c1", "tok-1"), error: null };
      await controller.start("5511", { fromTokens: ["tok-1"] });
      expect(wavoip.startCallCalls[0].fromTokens).toEqual(["tok-1"]);
    });

    it("derives fromTokens from enabled devices when not provided", async () => {
      wavoip.startCallResult = { data: new FakeOutgoingCall("c1", "tok-1"), error: null };
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
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      const result = await controller.start("5511");
      expect(result.err).toBeNull();
      expect(store.getState().outgoing?.id).toBe("c1");
      expect(store.getState().callStatus).toBe("CALLING");
    });

    it("returns a CallSummary with id + peer", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      const result = await controller.start("5511");
      if (result.err) throw new Error("expected success");
      expect(result.call.id).toBe("c1");
      expect(result.call.peer.phone).toBe(outgoing.peer.phone);
    });

    it("outgoing status RINGING updates callStatus to 'ringing'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.status = "RINGING";
      outgoing.emitEvent("ringing");
      expect(store.getState().callStatus).toBe("RINGING");
    });

    it("outgoing status FAILED transitions to 'failed'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.status = "FAILED";
      outgoing.emitEvent("failed", { code: "UNKNOWN" });
      expect(store.getState().callStatus).toBe("FAILED");
    });

    it("peerAccept moves outgoing to active and sets status", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      expect(store.getState().active?.id).toBe("c1");
      expect(store.getState().outgoing).toBeUndefined();
      expect(store.getState().callStatus).toBe("ACTIVE");
    });

    it("active call ended event sets status 'ended'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      active.status = "ENDED";
      active.emitEvent("ended");
      expect(store.getState().callStatus).toBe("ENDED");
    });

    it("active peerMute / peerUnmute toggles peerMuted", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      active.emitEvent("peerMuteChanged", true);
      expect(store.getState().peerMuted).toBe(true);
      active.emitEvent("peerMuteChanged", false);
      expect(store.getState().peerMuted).toBe(false);
    });

    it("active error event captures fail reason in store", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      active.status = "FAILED";
      active.emitEvent("failed", { code: "SERVER_ERROR" });
      expect(store.getState().callFailReason).toBe("SERVER_ERROR");
    });

    it("start clears any stale callFailReason from a prior call", async () => {
      store.getState().setCallFailReason("OLD_REASON");
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      expect(store.getState().callFailReason).toBeUndefined();
    });

    it("a dropped connection leg → 'DISCONNECTED'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      // Só o servidor decide que a chamada caiu, e a lib grava isso no `status` antes de
      // anunciar. O transporte piscando sem isso não é queda.
      active.status = "DISCONNECTED";
      active.emitEvent("connectionChanged", "disconnected");
      expect(store.getState().callStatus).toBe("DISCONNECTED");
    });

    it("a late dropped connection does not clobber a prior 'ended' state", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.emitEvent("accepted", active);
      active.status = "ENDED";
      active.emitEvent("connectionChanged", "disconnected");
      expect(store.getState().callStatus).toBe("ENDED");
    });

    it("outgoing peerReject → 'rejected'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.status = "REJECTED";
      outgoing.emitEvent("rejected");
      expect(store.getState().callStatus).toBe("REJECTED");
    });

    it("outgoing unanswered → 'unanswered'", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      outgoing.status = "NOT_ANSWERED";
      outgoing.emitEvent("unanswered");
      expect(store.getState().callStatus).toBe("NOT_ANSWERED");
    });
  });

  describe("dial", () => {
    it("tries the next device when one refuses", async () => {
      const recusa = { code: "DEVICE_BUSY" as const, devices: [{ token: "tok-1", error: { code: "DEVICE_BUSY" as const } }] };
      const outgoing = new FakeOutgoingCall("c1", "tok-2");
      let tentativas = 0;
      wavoip.startCall = (async (params: { fromTokens?: string[]; to: string }) => {
        tentativas++;
        wavoip.startCallCalls.push(params);
        return tentativas === 1 ? { data: null, error: recusa } : { data: outgoing, error: null };
      }) as typeof wavoip.startCall;

      await controller.dial("5511", ["tok-1", "tok-2"]);

      expect(wavoip.startCallCalls.map((c) => c.fromTokens?.[0])).toEqual(["tok-1", "tok-2"]);
      expect(store.getState().dialIsLoading).toBe(false);
    });

    it("stops without trying anyone else when there is no device", async () => {
      wavoip.startCallResult = { data: null, error: { code: "NO_DEVICES", devices: [] } };

      await controller.dial("5511", ["tok-1", "tok-2"]);

      expect(wavoip.startCallCalls).toHaveLength(1);
      expect(store.getState().dialError).toBe("NO_DEVICES");
    });

    it("gives up between devices once the dial token moves", async () => {
      const recusa = { code: "DEVICE_BUSY" as const, devices: [{ token: "tok-1", error: { code: "DEVICE_BUSY" as const } }] };
      wavoip.startCall = (async (params: { fromTokens?: string[]; to: string }) => {
        wavoip.startCallCalls.push(params);
        // Desistir chega enquanto este device é tentado, e não antes.
        controller.abortDial();
        return { data: null, error: recusa };
      }) as typeof wavoip.startCall;

      await controller.dial("5511", ["tok-1", "tok-2"]);

      expect(wavoip.startCallCalls).toHaveLength(1);
    });

    it("keeps the dialled number out of the input only when the call goes through", async () => {
      store.getState().setKeyboardInput("5511");
      wavoip.startCallResult = { data: new FakeOutgoingCall("c1", "tok-1"), error: null };

      await controller.dial("5511", ["tok-1"]);

      expect(store.getState().keyboardInput).toBe("");
      expect(store.getState().recentNumbers).toContain("5511");
    });
  });

  describe("end", () => {
    it("flips callStatus to 'ended' immediately on active end", async () => {
      const active = new FakeActiveCall("c1", "tok-1");
      store.getState().setActive(active);
      store.getState().setCallStatus("ACTIVE");
      await controller.end();
      expect(store.getState().callStatus).toBe("ENDED");
    });

    it("delegates to cancel() when only an outgoing call is in flight", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("CALLING");
      await controller.end();
      expect(outgoing.cancelCalls).toBe(1);
      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("no-ops when no call is in flight", async () => {
      const before = store.getState().callStatus;
      const result = await controller.end();
      expect(result.error).toBeNull();
      expect(store.getState().callStatus).toBe(before);
    });
  });

  describe("cancel", () => {
    it("flips callStatus to CANCELLED once the server confirms", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");

      const result = await controller.cancel();

      expect(result.error).toBeNull();
      expect(outgoing.cancelCalls).toBe(1);
      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("hands the refusal back to the caller", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      outgoing.cancelResult = { data: null, error: { code: "CALL_ALREADY_ANSWERED" } };
      store.getState().setOutgoing(outgoing);
      store.getState().setCallStatus("RINGING");

      const result = await controller.cancel();

      expect(result.error?.code).toBe("CALL_ALREADY_ANSWERED");
    });

    // Se o peer atende durante o await, o status já andou sozinho; desfazer às cegas o
    // arrastaria para RINGING e prenderia a tela em "Chamando...".
    it("does not clobber a status the server moved on during the await", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      outgoing.cancelResult = { data: null, error: { code: "CALL_ALREADY_ANSWERED" } };
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
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      outgoing.cancelResult = { data: null, error: { code: "CALL_ALREADY_ANSWERED" } };
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

      expect(result.error).toBeNull();
      expect(store.getState().callStatus).toBe(before);
    });
  });

  // A lib distingue os dois fins pelo `outcome.status` que viaja no `call:ended`, e o
  // getter já reflete isso quando o evento dispara. Espelhar preserva a distinção sem o
  // webphone precisar saber qual fim foi.
  describe("end", () => {
    it("does not read our own hangup as a dropped connection", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      const active = new FakeActiveCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");
      active.status = "ACTIVE";
      outgoing.emitEvent("accepted", active);

      // Como na lib: o status vira ENDED antes de a mídia parar, e a mídia parando emite
      // `connectionChanged`. Derivar o status do payload pintaria "DISCONNECTED" no
      // instante em que o operador desliga.
      active.end = async () => {
        active.status = "ENDED";
        active.emitEvent("connectionChanged", "disconnected");
        return active.endResult;
      };

      await controller.end();

      expect(store.getState().callStatus).toBe("ENDED");
    });
  });

  describe("outgoing terminal status", () => {
    it("keeps CANCELLED when the SDK reports a cancelled ending", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");

      outgoing.status = "CANCELLED";
      outgoing.emitEvent("ended");

      expect(store.getState().callStatus).toBe("CANCELLED");
    });

    it("still reports an ordinary hangup as ENDED", async () => {
      const outgoing = new FakeOutgoingCall("c1", "tok-1");
      wavoip.startCallResult = { data: outgoing, error: null };
      await controller.start("5511");

      outgoing.status = "ENDED";
      outgoing.emitEvent("ended");

      expect(store.getState().callStatus).toBe("ENDED");
    });
  });

  describe("ingestOffer", () => {
    it("adds the offer to store", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
    });

    it("offer ended event removes it", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("ended");
      expect(store.getState().offers).toEqual([]);
    });

    it("offer acceptedElsewhere event removes it", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("acceptedElsewhere");
      expect(store.getState().offers).toEqual([]);
    });

    it("accept() on a stored offer transitions to active call", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      const active = new FakeActiveCall("o1", "tok-1");
      offer.acceptResult = { data: active, error: null };
      controller.ingestOffer(offer);

      const [stored] = store.getState().offers;
      const result = await stored.accept();
      expect(result.error).toBeNull();
      expect(store.getState().active?.id).toBe("o1");
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().callStatus).toBe("ACTIVE");
    });

    it("accept() with err leaves offer in place and does not promote to active", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      offer.acceptResult = { data: null, error: { code: "CALL_NOT_FOUND" } };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.accept();
      expect(result.error?.code).toBe("CALL_NOT_FOUND");
      expect(store.getState().active).toBeUndefined();
    });

    it("reject() removes the offer and marks outcome 'rejected'", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      offer.rejectResult = { data: undefined, error: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.reject();
      expect(result.error).toBeNull();
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().lastOfferOutcomes.o1).toBe("rejected");
    });

    it("reject() with err leaves the offer in place and does not mark outcome", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      offer.rejectResult = { data: null, error: { code: "CALL_NOT_FOUND" } };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      const result = await stored.reject();
      expect(result.error?.code).toBe("CALL_NOT_FOUND");
      expect(store.getState().offers.map((o) => o.id)).toEqual(["o1"]);
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("accept() marks outcome 'accepted' on the promoted offer", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      const active = new FakeActiveCall("o1", "tok-1");
      offer.acceptResult = { data: active, error: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      await stored.accept();
      expect(store.getState().lastOfferOutcomes.o1).toBe("accepted");
    });

    it("acceptedElsewhere marks outcome 'elsewhere'", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("acceptedElsewhere");
      expect(store.getState().lastOfferOutcomes.o1).toBe("elsewhere");
    });

    it("rejectedElsewhere marks outcome 'elsewhere'", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("rejectedElsewhere");
      expect(store.getState().lastOfferOutcomes.o1).toBe("elsewhere");
    });

    it("ended does not mark an outcome (counts as missed downstream)", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("ended");
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("unanswered does not mark an outcome (counts as missed downstream)", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      offer.emitEvent("cancelled");
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("ignore() removes the offer and does not mark an outcome (counts as missed downstream, like a real phone's 'ignore')", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      stored.ignore();
      expect(store.getState().offers).toEqual([]);
      expect(store.getState().lastOfferOutcomes.o1).toBeUndefined();
    });

    it("ignore() does not touch an offer that already left the store via accept()", async () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      const active = new FakeActiveCall("o1", "tok-1");
      offer.acceptResult = { data: active, error: null };
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      await stored.accept();

      stored.ignore();

      expect(store.getState().active?.id).toBe("o1");
      expect(store.getState().lastOfferOutcomes.o1).toBe("accepted");
    });

    it("ignore() is a no-op when called twice in a row", () => {
      const offer = new FakeIncomingCall("o1", "tok-1");
      controller.ingestOffer(offer);
      const [stored] = store.getState().offers;
      stored.ignore();
      expect(() => stored.ignore()).not.toThrow();
      expect(store.getState().offers).toEqual([]);
    });
  });
});

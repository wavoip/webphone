import { beforeEach, describe, expect, it, vi } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { buildPublicApi } from "@/middleware/public-api/buildPublicApi";
import type { WebphoneAPI } from "@/lib/webphone-api/WebphoneAPI";
import { FakeCallActive, FakeCallOutgoing, FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

describe("buildPublicApi", () => {
  let wavoip: FakeWavoip;
  let middleware: Middleware;
  let api: WebphoneAPI;

  beforeEach(() => {
    wavoip = new FakeWavoip(["tok-1"]);
    middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
    api = buildPublicApi(middleware);
  });

  describe("call", () => {
    it("start delegates to the call controller", async () => {
      wavoip.startCallResult = { call: new FakeCallOutgoing("c1", "tok-1"), err: null };
      const result = await api.call.start("5511");
      expect(result.err).toBeNull();
      expect(wavoip.startCallCalls[0].to).toBe("5511");
    });

    it("startCall (deprecated) passes fromTokens via the start signature", async () => {
      wavoip.startCallResult = { call: new FakeCallOutgoing("c1", "tok-1"), err: null };
      await api.call.startCall("5511", ["tok-1"]);
      expect(wavoip.startCallCalls[0].fromTokens).toEqual(["tok-1"]);
    });

    it("getCallActive returns a projected snapshot of the active call", () => {
      const active = new FakeCallActive("c1", "tok-1");
      middleware.store.getState().setActive(active);
      const snapshot = api.call.getCallActive();
      expect(snapshot?.id).toBe("c1");
      expect(snapshot?.peer.phone).toBe(active.peer.phone);
    });

    it("getCallOutgoing returns undefined when there is no outgoing call", () => {
      expect(api.call.getCallOutgoing()).toBeUndefined();
    });

    it("getOffers projects every stored offer", () => {
      middleware.store.getState().addOffer(new FakeOffer("o1", "tok-1"));
      middleware.store.getState().addOffer(new FakeOffer("o2", "tok-1"));
      expect(api.call.getOffers().map((o) => o.id)).toEqual(["o1", "o2"]);
    });

    it("onOffer registers a callback that fires when offers arrive", async () => {
      const cb = vi.fn();
      api.call.onOffer(cb);
      wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
      await new Promise((r) => setTimeout(r, 0));
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb.mock.calls[0][0].id).toBe("o1");
    });
  });

  describe("device", () => {
    it("get returns the current device list", () => {
      expect(api.device.get().map((d) => d.token)).toEqual(["tok-1"]);
    });

    it("add appends a device", () => {
      api.device.add("tok-2", false);
      expect(api.device.get().map((d) => d.token)).toContain("tok-2");
    });

    it("remove drops a device", () => {
      api.device.remove("tok-1");
      expect(api.device.get()).toEqual([]);
    });

    it("enable / disable toggle the enable flag", () => {
      api.device.enable("tok-1");
      expect(api.device.get()[0].enable).toBe(true);
      api.device.disable("tok-1");
      expect(api.device.get()[0].enable).toBe(false);
    });
  });

  describe("notifications", () => {
    it("add inserts a notification", () => {
      api.notifications.add({
        id: new Date(),
        type: "INFO",
        created_at: new Date(),
        message: "hi",
        detail: "",
        token: "tok-1",
        isHidden: false,
        isRead: false,
      });
      expect(api.notifications.get()).toHaveLength(1);
    });

    it("clear empties the notifications", () => {
      api.notifications.add({
        id: new Date(),
        type: "INFO",
        created_at: new Date(),
        message: "hi",
        detail: "",
        token: "tok-1",
        isHidden: false,
        isRead: false,
      });
      api.notifications.clear();
      expect(api.notifications.get()).toEqual([]);
    });
  });

  describe("widget", () => {
    it("open / close / toggle flip the widget state", () => {
      api.widget.open();
      expect(api.widget.isOpen).toBe(true);
      api.widget.close();
      expect(api.widget.isOpen).toBe(false);
      api.widget.toggle();
      expect(api.widget.isOpen).toBe(true);
    });

    it("buttonPosition.value reflects the current store value", () => {
      middleware.store.getState().setButtonPosition({ x: 12, y: 34 });
      expect(api.widget.buttonPosition.value).toEqual({ x: 12, y: 34 });
    });

    it("buttonPosition.set accepts coordinates", () => {
      api.widget.buttonPosition.set({ x: 7, y: 9 });
      expect(middleware.store.getState().buttonPosition).toEqual({ x: 7, y: 9 });
    });
  });

  describe("theme + settings + position", () => {
    it("theme.set updates the store", () => {
      api.theme.set("dark");
      expect(middleware.store.getState().theme).toBe("dark");
    });

    it("setShowNotifications updates the flag", () => {
      api.settings.setShowNotifications(false);
      expect(middleware.store.getState().settings.showNotifications).toBe(false);
    });

    it("position.set accepts coordinates", () => {
      api.position.set({ x: 100, y: 200 });
      expect(middleware.store.getState().position).toEqual({ x: 100, y: 200 });
    });
  });
});

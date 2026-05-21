import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FakeCallActive, FakeCallOutgoing, FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { renderWithMiddleware, resetPublicApiBetweenTests } from "@/middleware/testing/renderWithMiddleware";

describe("public API React-tree integration", () => {
  beforeEach(() => {
    resetPublicApiBetweenTests();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("device hydration", () => {
    it("exposes devices from the injected Wavoip via window.wavoip-equivalent api", async () => {
      const wavoip = new FakeWavoip(["tok-a", "tok-b"]);
      const { api } = await renderWithMiddleware({ wavoip });
      expect(api.device.get().map((d) => d.token)).toEqual(["tok-a", "tok-b"]);
    });

    it("merges stored tokens into the injected (empty) Wavoip on mount", async () => {
      // Regression: dev.tsx passes an empty Wavoip while localStorage has
      // tokens — those tokens were silently dropped before the merge fix.
      localStorage.setItem("wavoip:tokens", "tok-stored:true:true");
      const wavoip = new FakeWavoip();
      const { api } = await renderWithMiddleware({ wavoip });
      expect(api.device.get().map((d) => d.token)).toEqual(["tok-stored"]);
      expect(api.device.get()[0].persist).toBe(true);
    });

    it("api.device.add(token, true) persists to localStorage round-trip", async () => {
      const wavoip = new FakeWavoip();
      const { api } = await renderWithMiddleware({ wavoip });
      api.device.add("tok-new", true);
      expect(localStorage.getItem("wavoip:tokens")).toBe("tok-new:false:true");
    });

    it("api.device.add(token) without persist does not write localStorage", async () => {
      const wavoip = new FakeWavoip();
      const { api } = await renderWithMiddleware({ wavoip });
      api.device.add("tok-ephemeral", false);
      expect(localStorage.getItem("wavoip:tokens")).toBe("");
    });
  });

  describe("call lifecycle", () => {
    it("api.call.start sets callStatus to CALLING", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      wavoip.startCallResult = { call: new FakeCallOutgoing("c1", "tok-1"), err: null };
      const { api } = await renderWithMiddleware({ wavoip });
      await api.call.start("5511", { fromTokens: ["tok-1"] });
      expect(api.call.getCallOutgoing()?.status).toBe("CALLING");
    });

    it("api.on('call:accepted') fires when outgoing call gets accepted", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      const outgoing = new FakeCallOutgoing("c1", "tok-1");
      wavoip.startCallResult = { call: outgoing, err: null };
      const { api } = await renderWithMiddleware({ wavoip });
      const events: string[] = [];
      api.on("call:accepted", (payload) => events.push(payload.id));
      await api.call.start("5511");
      outgoing.emitEvent("peerAccept", new FakeCallActive("c1", "tok-1"));
      expect(events).toEqual(["c1"]);
    });

    it("offer arriving emits 'offer:received'", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      const { api } = await renderWithMiddleware({ wavoip });
      const events: string[] = [];
      api.on("offer:received", (payload) => events.push(payload.id));
      wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
      await new Promise((r) => setTimeout(r, 0));
      expect(events).toEqual(["o1"]);
    });

    it("api.use('offer', fn) can block offers from reaching the store", async () => {
      const wavoip = new FakeWavoip(["tok-1"]);
      const { api } = await renderWithMiddleware({ wavoip });
      api.use("offer", () => {});
      wavoip.emitEvent("offer", new FakeOffer("o-blocked", "tok-1"));
      await new Promise((r) => setTimeout(r, 0));
      expect(api.call.getOffers()).toEqual([]);
    });
  });

  describe("widget + theme + settings", () => {
    it("api.widget.open/close/toggle reflect in api.widget.isOpen", async () => {
      const { api } = await renderWithMiddleware();
      api.widget.open();
      expect(api.widget.isOpen).toBe(true);
      api.widget.close();
      expect(api.widget.isOpen).toBe(false);
      api.widget.toggle();
      expect(api.widget.isOpen).toBe(true);
    });

    it("api.theme.set updates api.theme.value", async () => {
      const { api } = await renderWithMiddleware();
      api.theme.set("dark");
      expect(api.theme.value).toBe("dark");
    });

    it("api.settings.setShowNotifications toggles the flag", async () => {
      const { api } = await renderWithMiddleware();
      api.settings.setShowNotifications(false);
      expect(api.settings.showNotifications).toBe(false);
    });
  });
});

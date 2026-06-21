import { beforeEach, describe, expect, it } from "vitest";
import { MissedCallController, peerLabel } from "@/middleware/controllers/MissedCallController";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeOffer, makePeer } from "@/middleware/testing/FakeWavoip";

function buildOffer(id: string, displayName: string | null, phone = "5511999999999") {
  return new FakeOffer(id, "device-1", { ...makePeer(phone), displayName });
}

describe("MissedCallController", () => {
  let store: MiddlewareStoreApi;
  let controller: MissedCallController;

  beforeEach(() => {
    store = createMiddlewareStore();
    controller = new MissedCallController({ store });
  });

  it("records a MISSED_CALL notification with peer label as message", () => {
    controller.record(buildOffer("o1", "Maria"));
    const list = store.getState().notifications;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      type: "MISSED_CALL",
      message: "Maria",
      detail: "5511999999999",
      token: "device-1",
      isRead: false,
    });
  });

  it("falls back to phone when displayName is null", () => {
    controller.record(buildOffer("o1", null, "5511888888888"));
    const list = store.getState().notifications;
    expect(list[0]?.message).toBe("5511888888888");
  });

  it("does not persist to localStorage (in-memory only)", () => {
    controller.record(buildOffer("o1", "Maria"));
    expect(localStorage.getItem("webphone_notifications")).toBeNull();
  });
});

describe("peerLabel", () => {
  it("returns displayName when present", () => {
    expect(peerLabel(buildOffer("o1", "Maria"))).toBe("Maria");
  });

  it("trims whitespace-only displayName before falling back", () => {
    expect(peerLabel(buildOffer("o1", "   "))).toBe("5511999999999");
  });

  it("returns phone when displayName is null", () => {
    expect(peerLabel(buildOffer("o1", null, "5511777777777"))).toBe("5511777777777");
  });

  it("returns 'Desconhecido' when both displayName and phone are blank", () => {
    expect(peerLabel(buildOffer("o1", null, " "))).toBe("Desconhecido");
  });
});

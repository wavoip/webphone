import { describe, expect, it } from "vitest";
import { createMiddlewareStore } from "@/middleware/store/createStore";

describe("createMiddlewareStore", () => {
  it("composes every slice's state and actions in one store", () => {
    const store = createMiddlewareStore();
    const s = store.getState();

    expect(s.offers).toEqual([]);
    expect(s.devices).toEqual([]);
    expect(s.notifications).toEqual([]);
    expect(s.isClosed).toBe(true);
    expect(s.screen).toBe("keyboard");

    expect(typeof s.addOffer).toBe("function");
    expect(typeof s.upsertDevice).toBe("function");
    expect(typeof s.addNotification).toBe("function");
    expect(typeof s.openWidget).toBe("function");
    expect(typeof s.setScreen).toBe("function");
  });

  it("returns independent store instances", () => {
    const a = createMiddlewareStore();
    const b = createMiddlewareStore();

    a.getState().setScreen("call");
    expect(a.getState().screen).toBe("call");
    expect(b.getState().screen).toBe("keyboard");
  });
});

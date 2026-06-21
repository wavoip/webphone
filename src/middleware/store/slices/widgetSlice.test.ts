import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("widgetSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts closed at origin", () => {
    const s = store.getState();
    expect(s.isClosed).toBe(true);
    expect(s.position).toEqual({ x: 0, y: 0 });
    expect(s.buttonPosition).toEqual({ x: 0, y: 0 });
  });

  it("openWidget clears isClosed", () => {
    store.getState().openWidget();
    expect(store.getState().isClosed).toBe(false);
  });

  it("closeWidget sets isClosed", () => {
    store.getState().openWidget();
    store.getState().closeWidget();
    expect(store.getState().isClosed).toBe(true);
  });

  it("toggleWidget flips isClosed", () => {
    expect(store.getState().isClosed).toBe(true);
    store.getState().toggleWidget();
    expect(store.getState().isClosed).toBe(false);
    store.getState().toggleWidget();
    expect(store.getState().isClosed).toBe(true);
  });

  it("setWidgetPosition writes coordinates", () => {
    store.getState().setWidgetPosition({ x: 10, y: 20 });
    expect(store.getState().position).toEqual({ x: 10, y: 20 });
  });

  it("setButtonPosition writes coordinates", () => {
    store.getState().setButtonPosition({ x: 5, y: 6 });
    expect(store.getState().buttonPosition).toEqual({ x: 5, y: 6 });
  });
});

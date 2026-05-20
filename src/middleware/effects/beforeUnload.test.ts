import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beforeUnloadEffect } from "@/middleware/effects/beforeUnload";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("beforeUnloadEffect", () => {
  let store: MiddlewareStoreApi;
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    store = createMiddlewareStore();
    addSpy = vi.spyOn(window, "addEventListener");
    removeSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it.each(["CALLING", "RINGING", "ACTIVE", "DISCONNECTED"] as const)(
    "registers beforeunload when status becomes %s",
    (status) => {
      const unsub = beforeUnloadEffect({ store });
      store.getState().setCallStatus(status);
      expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
      unsub();
    },
  );

  it("removes beforeunload when status returns to idle", () => {
    const unsub = beforeUnloadEffect({ store });
    store.getState().setCallStatus("ACTIVE");
    store.getState().setCallStatus("idle");
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
    unsub();
  });

  it("does not register twice on consecutive in-call statuses", () => {
    const unsub = beforeUnloadEffect({ store });
    store.getState().setCallStatus("CALLING");
    store.getState().setCallStatus("RINGING");
    store.getState().setCallStatus("ACTIVE");

    const addCalls = addSpy.mock.calls.filter((c: unknown[]) => c[0] === "beforeunload").length;
    expect(addCalls).toBe(1);
    unsub();
  });

  it("unsub removes any registered listener", () => {
    const unsub = beforeUnloadEffect({ store });
    store.getState().setCallStatus("ACTIVE");
    unsub();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });
});

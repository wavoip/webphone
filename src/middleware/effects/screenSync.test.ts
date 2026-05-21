import { beforeEach, describe, expect, it } from "vitest";
import { screenSyncEffect } from "@/middleware/effects/screenSync";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";
import { FakeCallActive, FakeCallOutgoing } from "@/middleware/testing/FakeWavoip";

describe("screenSyncEffect", () => {
  let store: MiddlewareStoreApi;
  let unsub: () => void;

  beforeEach(() => {
    store = createMiddlewareStore();
    unsub = screenSyncEffect({ store });
  });

  it("switches to 'call' when an active call appears", () => {
    store.getState().setActive(new FakeCallActive("c1", "tok-1"));
    expect(store.getState().screen).toBe("call");
    unsub();
  });

  it("switches to 'outgoing' when an outgoing call appears (no active)", () => {
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    expect(store.getState().screen).toBe("outgoing");
    unsub();
  });

  it("returns to 'keyboard' when calls clear and status is 'idle'", () => {
    store.getState().setActive(new FakeCallActive("c1", "tok-1"));
    store.getState().setActive(undefined);
    store.getState().setCallStatus("idle");
    expect(store.getState().screen).toBe("keyboard");
    unsub();
  });

  it("stays on 'call' when status flips to ENDED while active call is still set", () => {
    // In real flow CallController.bindActive emits `setCallStatus("ENDED")`
    // without clearing `active`; the active call only goes undefined when
    // someone explicitly calls resetCall. The screen must stay on "call" so
    // the user sees the final status message.
    store.getState().setActive(new FakeCallActive("c1", "tok-1"));
    expect(store.getState().screen).toBe("call");
    store.getState().setCallStatus("ENDED");
    expect(store.getState().screen).toBe("call");
    unsub();
  });

  it("prefers active over outgoing when both are set", () => {
    store.getState().setOutgoing(new FakeCallOutgoing("c1", "tok-1"));
    store.getState().setActive(new FakeCallActive("c1", "tok-1"));
    expect(store.getState().screen).toBe("call");
    unsub();
  });
});

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import {
  MiddlewareProvider,
  useCallState,
  useDevices,
  useMiddleware,
  useNotifications,
  useOffers,
  useUiState,
  useWidgetState,
} from "@/middleware/react/hooks";
import { FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";

function withProvider(mw: Middleware) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MiddlewareProvider middleware={mw}>{children}</MiddlewareProvider>;
  };
}

describe("MiddlewareProvider + hooks", () => {
  let wavoip: FakeWavoip;
  let middleware: Middleware;

  beforeEach(() => {
    wavoip = new FakeWavoip(["tok-1"]);
    middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
  });

  it("useMiddleware throws when used outside MiddlewareProvider", () => {
    expect(() => renderHook(() => useMiddleware())).toThrow(/MiddlewareProvider/);
  });

  it("useMiddleware returns the provided instance", () => {
    const { result } = renderHook(() => useMiddleware(), { wrapper: withProvider(middleware) });
    expect(result.current).toBe(middleware);
  });

  it("useCallState reflects initial state", () => {
    const { result } = renderHook(() => useCallState(), { wrapper: withProvider(middleware) });
    expect(result.current.callStatus).toBe("idle");
    expect(result.current.peerMuted).toBe(false);
    expect(result.current.outgoing).toBeUndefined();
    expect(result.current.active).toBeUndefined();
  });

  it("useCallState re-renders on callStatus changes", () => {
    const { result } = renderHook(() => useCallState(), { wrapper: withProvider(middleware) });
    act(() => middleware.store.getState().setCallStatus("CALLING"));
    expect(result.current.callStatus).toBe("CALLING");
  });

  it("useDevices reflects current devices", () => {
    const { result } = renderHook(() => useDevices(), { wrapper: withProvider(middleware) });
    expect(result.current.map((d) => d.token)).toEqual(["tok-1"]);
  });

  it("useOffers updates when an offer arrives", async () => {
    const { result } = renderHook(() => useOffers(), { wrapper: withProvider(middleware) });
    await act(async () => {
      wavoip.emitEvent("offer", new FakeOffer("o1", "tok-1"));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current.map((o) => o.id)).toEqual(["o1"]);
  });

  it("useNotifications starts empty and reflects controller updates", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: withProvider(middleware) });
    expect(result.current).toEqual([]);
    act(() => {
      middleware.controllers.notifications.add({
        id: "hook-1",
        type: "INFO",
        created_at: new Date(),
        message: "hi",
        detail: "",
        token: "tok",
        isHidden: false,
        isRead: false,
      });
    });
    expect(result.current).toHaveLength(1);
  });

  it("useWidgetState reflects open/close transitions", () => {
    const { result } = renderHook(() => useWidgetState(), { wrapper: withProvider(middleware) });
    expect(result.current.isClosed).toBe(true);
    act(() => middleware.store.getState().openWidget());
    expect(result.current.isClosed).toBe(false);
  });

  it("useUiState returns screen + theme + settings", () => {
    const { result } = renderHook(() => useUiState(), { wrapper: withProvider(middleware) });
    expect(result.current.screen).toBe("keyboard");
    expect(result.current.theme).toBe("system");
    expect(result.current.settings.showWidgetButton).toBe(true);
    act(() => middleware.store.getState().setScreen("call"));
    expect(result.current.screen).toBe("call");
  });
});

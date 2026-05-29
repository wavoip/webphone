import { act, renderHook } from "@testing-library/react";
import type { ConnectivityIssue, IceDiagnostics } from "@wavoip/wavoip-api";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { FakeCallActive, FakeCallOutgoing, FakeOffer, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { DebugProvider, useDebugInfo } from "@/providers/DebugProvider";

function wrap(middleware: Middleware) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MiddlewareProvider middleware={middleware}>
        <DebugProvider>{children}</DebugProvider>
      </MiddlewareProvider>
    );
  };
}

function setupMiddleware() {
  const wavoip = new FakeWavoip(["tok-1"]);
  const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
  return { middleware, wavoip };
}

function addOffer(middleware: Middleware, offer: FakeOffer) {
  middleware.store.getState().addOffer(offer as never);
}

const sampleDiag: IceDiagnostics = {
  gatheringDurationMs: 120,
  gatheringTimedOut: false,
  candidatesByType: { host: 2, srflx: 1, prflx: 0, relay: 0 },
  stunReached: true,
  turnReached: false,
};

describe("DebugProvider", () => {
  let middleware: Middleware;

  beforeEach(() => {
    const setup = setupMiddleware();
    middleware = setup.middleware;
  });

  it("starts with empty diagnostics and issues", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });
    expect(result.current.lastIceDiagnostics).toBeNull();
    expect(result.current.recentIssues).toEqual([]);
  });

  it("captures iceDiagnostics emitted by an incoming offer", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const offer = new FakeOffer("offer-1", "tok-1");
    act(() => addOffer(middleware, offer));
    act(() => offer.emitEvent("iceDiagnostics", sampleDiag));

    expect(result.current.lastIceDiagnostics).toEqual(sampleDiag);
  });

  it("captures connectivityIssue emitted by an active call", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeCallActive("call-1", "tok-1");
    act(() => {
      middleware.store.getState().setActive(active);
      active.emitEvent("connectivityIssue", "STUN_UNREACHABLE" satisfies ConnectivityIssue);
    });

    expect(result.current.recentIssues.map((i) => i.issue)).toContain("STUN_UNREACHABLE");
    expect(result.current.recentIssues[0].at).toBeTypeOf("number");
  });

  it("captures connectivityIssue emitted by an outgoing call", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const outgoing = new FakeCallOutgoing("call-2", "tok-1");
    act(() => {
      middleware.store.getState().setOutgoing(outgoing);
      outgoing.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED" satisfies ConnectivityIssue);
    });

    expect(result.current.recentIssues.map((i) => i.issue)).toContain("ICE_CONNECTION_FAILED");
  });

  it("caps the issue ring buffer at 20 entries", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeCallActive("call-3", "tok-1");
    act(() => middleware.store.getState().setActive(active));

    act(() => {
      for (let i = 0; i < 25; i++) active.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED");
    });

    expect(result.current.recentIssues).toHaveLength(20);
  });

  it("unsubscribes from a call after it leaves the store", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeCallActive("call-4", "tok-1");
    act(() => middleware.store.getState().setActive(active));
    act(() => active.emitEvent("connectivityIssue", "STUN_UNREACHABLE"));
    expect(result.current.recentIssues).toHaveLength(1);

    act(() => middleware.store.getState().setActive(undefined));
    act(() => active.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED"));

    expect(result.current.recentIssues).toHaveLength(1);
  });
});

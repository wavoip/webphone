import type { ConnectivityIssue, IceDiagnostics } from "@wavoip/wavoip-api/web";
import type { JSX } from "solid-js";
import { beforeEach, describe, expect, it } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { MiddlewareProvider } from "@/middleware/solid/context";
import { act, renderHook } from "@/middleware/testing/dom";
import { FakeActiveCall, FakeIncomingCall, FakeOutgoingCall, FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { DebugProvider, useDebugInfo } from "@/providers/DebugProvider";

function wrap(middleware: Middleware) {
  return function Wrapper(props: { children: JSX.Element }) {
    return (
      <MiddlewareProvider middleware={middleware}>
        <DebugProvider>{props.children}</DebugProvider>
      </MiddlewareProvider>
    );
  };
}

function setupMiddleware() {
  const wavoip = new FakeWavoip(["tok-1"]);
  const middleware = new Middleware({ wavoip: wavoip.asWavoip() }).init();
  return { middleware, wavoip };
}

function addOffer(middleware: Middleware, offer: FakeIncomingCall) {
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
    expect(result.recentIceDiagnostics).toEqual([]);
    expect(result.recentIssues).toEqual([]);
  });

  it("captures iceDiagnostics emitted by an incoming offer with its call id", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const offer = new FakeIncomingCall("offer-1", "tok-1");
    act(() => addOffer(middleware, offer));
    act(() => offer.emitEvent("iceDiagnostics", sampleDiag));

    expect(result.recentIceDiagnostics).toHaveLength(1);
    expect(result.recentIceDiagnostics[0].callId).toBe("offer-1");
    expect(result.recentIceDiagnostics[0].diag).toEqual(sampleDiag);
    expect(result.recentIceDiagnostics[0].at).toBeTypeOf("number");
  });

  it("captures connectivityIssue emitted by an active call with its call id", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeActiveCall("call-1", "tok-1");
    act(() => {
      middleware.store.getState().setActive(active);
      active.emitEvent("connectivityIssue", "STUN_UNREACHABLE" satisfies ConnectivityIssue);
    });

    expect(result.recentIssues).toHaveLength(1);
    expect(result.recentIssues[0].callId).toBe("call-1");
    expect(result.recentIssues[0].issue).toBe("STUN_UNREACHABLE");
    expect(result.recentIssues[0].at).toBeTypeOf("number");
  });

  it("captures connectivityIssue emitted by an outgoing call with its call id", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const outgoing = new FakeOutgoingCall("call-2", "tok-1");
    act(() => {
      middleware.store.getState().setOutgoing(outgoing);
      outgoing.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED" satisfies ConnectivityIssue);
    });

    expect(result.recentIssues[0].callId).toBe("call-2");
    expect(result.recentIssues[0].issue).toBe("ICE_CONNECTION_FAILED");
  });

  it("caps the issue ring buffer at 20 entries", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeActiveCall("call-3", "tok-1");
    act(() => middleware.store.getState().setActive(active));

    act(() => {
      for (let i = 0; i < 25; i++) active.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED");
    });

    expect(result.recentIssues).toHaveLength(20);
  });

  it("caps the ICE diagnostics ring buffer at 20 entries", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeActiveCall("call-3b", "tok-1");
    act(() => middleware.store.getState().setActive(active));

    act(() => {
      for (let i = 0; i < 25; i++) active.emitEvent("iceDiagnostics", sampleDiag);
    });

    expect(result.recentIceDiagnostics).toHaveLength(20);
  });

  it("unsubscribes from a call after it leaves the store", () => {
    const { result } = renderHook(() => useDebugInfo(), { wrapper: wrap(middleware) });

    const active = new FakeActiveCall("call-4", "tok-1");
    act(() => middleware.store.getState().setActive(active));
    act(() => active.emitEvent("connectivityIssue", "STUN_UNREACHABLE"));
    expect(result.recentIssues).toHaveLength(1);

    act(() => middleware.store.getState().setActive(undefined));
    act(() => active.emitEvent("connectivityIssue", "ICE_CONNECTION_FAILED"));

    expect(result.recentIssues).toHaveLength(1);
  });
});

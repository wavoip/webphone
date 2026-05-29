import { render, screen, waitFor } from "@testing-library/react";
import type { IceDiagnostics } from "@wavoip/wavoip-api";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { DebugProvider } from "@/providers/DebugProvider";
import { DebugScreen } from "@/screens/DebugScreen";

vi.mock("@wavoip/wavoip-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@wavoip/wavoip-api")>();
  return {
    ...actual,
    runStunProbe: vi.fn().mockResolvedValue([
      { server: "stun:stun.l.google.com:19302", reachable: true, latencyMs: 42 },
      { server: "stun:stun.cloudflare.com:3478", reachable: false },
    ]),
  };
});

function Wrapper({ children }: { children: ReactNode }) {
  const middleware = new Middleware({ wavoip: new FakeWavoip(["tok-1"]).asWavoip() }).init();
  return (
    <MiddlewareProvider middleware={middleware}>
      <DebugProvider>{children}</DebugProvider>
    </MiddlewareProvider>
  );
}

describe("DebugScreen", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    writeText.mockClear();
  });

  afterEach(() => {
    delete (navigator as unknown as { clipboard?: unknown }).clipboard;
  });

  it("renders the main sections", () => {
    render(<DebugScreen onClose={() => {}} />, { wrapper: Wrapper });
    expect(screen.getByText(/Navegador/i)).toBeDefined();
    expect(screen.getByText(/Rede/i)).toBeDefined();
    expect(screen.getByText(/Áudio/i)).toBeDefined();
    expect(screen.getByText(/Reachability STUN/i)).toBeDefined();
  });

  it("runs runStunProbe when the user clicks the probe button and renders results", async () => {
    const api = await import("@wavoip/wavoip-api");
    render(<DebugScreen onClose={() => {}} />, { wrapper: Wrapper });

    const button = screen.getByRole("button", { name: /Testar STUN/i });
    button.click();

    await waitFor(() => {
      expect(api.runStunProbe).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/stun\.l\.google\.com/)).toBeDefined();
    });
  });

  it("copies a JSON report when the copy button is clicked", async () => {
    render(<DebugScreen onClose={() => {}} />, { wrapper: Wrapper });

    const copy = screen.getByRole("button", { name: /Copiar relatório/i });
    copy.click();

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const payload = JSON.parse(writeText.mock.calls[0][0] as string);
    expect(payload).toHaveProperty("system");
    expect(payload).toHaveProperty("lastIceDiagnostics");
    expect(payload).toHaveProperty("recentIssues");
  });

  it("calls onClose when the user clicks the close button", () => {
    const onClose = vi.fn();
    render(<DebugScreen onClose={onClose} />, { wrapper: Wrapper });
    screen.getByRole("button", { name: /Fechar/i }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// Ensure the diagnostics snapshot type stays compatible with what the screen consumes.
const _diagShape: IceDiagnostics = {
  gatheringDurationMs: 0,
  gatheringTimedOut: false,
  candidatesByType: { host: 0, srflx: 0, prflx: 0, relay: 0 },
  stunReached: false,
  turnReached: false,
};
void _diagShape;

import { render, screen, waitFor } from "@testing-library/react";
import type { IceDiagnostics } from "@wavoip/wavoip-api/web";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Middleware } from "@/middleware/Middleware";
import { MiddlewareProvider } from "@/middleware/react/hooks";
import { FakeWavoip } from "@/middleware/testing/FakeWavoip";
import { DebugProvider } from "@/providers/DebugProvider";
import { DebugScreen } from "@/screens/DebugScreen";

vi.mock("@wavoip/wavoip-api/web", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@wavoip/wavoip-api/web")>();
  return {
    ...actual,
    runDiagnostics: vi.fn().mockResolvedValue({
      checks: [
        { code: "MICROPHONE_FOUND", severity: "ok" },
        { code: "STUN_UNREACHABLE", severity: "failure" },
      ],
      readiness: {
        OFFICIAL: { ready: false, blockedBy: ["STUN_UNREACHABLE"] },
        UNOFFICIAL: { ready: true, blockedBy: [] },
      },
    }),
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
    render(<DebugScreen />, { wrapper: Wrapper });
    expect(screen.getByText(/Navegador/i)).toBeDefined();
    expect(screen.getByText(/Rede/i)).toBeDefined();
    expect(screen.getByText(/Áudio/i)).toBeDefined();
    expect(screen.getByText(/Checagem do ambiente/i)).toBeDefined();
  });

  it("runs runDiagnostics when the user clicks the check button and renders the report", async () => {
    const api = await import("@wavoip/wavoip-api/web");
    render(<DebugScreen />, { wrapper: Wrapper });

    const button = screen.getByRole("button", { name: /Testar ambiente/i });
    button.click();

    await waitFor(() => {
      expect(api.runDiagnostics).toHaveBeenCalled();
    });
    await waitFor(() => {
      // Aparece duas vezes: no que bloqueia a chamada OFFICIAL e na lista de checagens.
      expect(screen.getAllByText("STUN_UNREACHABLE").length).toBe(2);
    });
  });

  it("copies a JSON report when the copy button is clicked", async () => {
    render(<DebugScreen />, { wrapper: Wrapper });

    const copy = screen.getByRole("button", { name: /Copiar relatório/i });
    copy.click();

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const payload = JSON.parse(writeText.mock.calls[0][0] as string);
    expect(payload).toHaveProperty("system");
    expect(payload).toHaveProperty("recentIceDiagnostics");
    expect(payload).toHaveProperty("recentIssues");
  });
});

// Quebra a compilação se o tipo do diagnóstico deixar de servir à tela.
const _diagShape: IceDiagnostics = {
  gatheringDurationMs: 0,
  gatheringTimedOut: false,
  candidatesByType: { host: 0, srflx: 0, prflx: 0, relay: 0 },
  stunReached: false,
  turnReached: false,
};
void _diagShape;

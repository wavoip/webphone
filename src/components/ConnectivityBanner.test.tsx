import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectivityBanner } from "@/components/ConnectivityBanner";

describe("ConnectivityBanner", () => {
  it("renders nothing when no issue is provided", () => {
    const { container } = render(<ConnectivityBanner issue={null} onDismiss={() => {}} onOpenDebug={() => {}} />);
    expect(container.children.length).toBe(0);
  });

  it("renders the STUN unreachable message in Portuguese", () => {
    render(<ConnectivityBanner issue="STUN_UNREACHABLE" onDismiss={() => {}} onOpenDebug={() => {}} />);
    expect(screen.getByRole("alert").textContent).toMatch(/STUN inacessível/i);
  });

  it("renders the symmetric NAT message in Portuguese", () => {
    render(<ConnectivityBanner issue="SYMMETRIC_NAT_SUSPECTED" onDismiss={() => {}} onOpenDebug={() => {}} />);
    expect(screen.getByRole("alert").textContent).toMatch(/NAT simétrico/i);
  });

  it("calls onDismiss when the close button is clicked", async () => {
    const onDismiss = vi.fn();
    render(<ConnectivityBanner issue="STUN_UNREACHABLE" onDismiss={onDismiss} onOpenDebug={() => {}} />);
    const alert = screen.getByRole("alert");
    const dismiss = within(alert).getByRole("button", { name: /fechar/i });
    dismiss.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenDebug when the diagnostics button is clicked", async () => {
    const onOpenDebug = vi.fn();
    render(<ConnectivityBanner issue="STUN_UNREACHABLE" onDismiss={() => {}} onOpenDebug={onOpenDebug} />);
    const alert = screen.getByRole("alert");
    const button = within(alert).getByRole("button", { name: /diagnóstico/i });
    button.click();
    expect(onOpenDebug).toHaveBeenCalledTimes(1);
  });
});

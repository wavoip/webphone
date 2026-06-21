import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyablePeer } from "@/components/CopyablePeer";

class FakeClipboard {
  texts: string[] = [];
  resolve: () => void = () => {};
  rejection: Error | null = null;

  writeText = async (text: string): Promise<void> => {
    if (this.rejection) throw this.rejection;
    this.texts.push(text);
  };
}

describe("CopyablePeer", () => {
  let clipboard: FakeClipboard;
  let originalClipboard: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    clipboard = new FakeClipboard();
    originalClipboard = Object.getOwnPropertyDescriptor(globalThis.navigator, "clipboard");
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: clipboard,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalClipboard) {
      Object.defineProperty(globalThis.navigator, "clipboard", originalClipboard);
    } else {
      Object.defineProperty(globalThis.navigator, "clipboard", { value: undefined, configurable: true });
    }
  });

  it("renders displayName when present, falling back to phone", () => {
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    expect(screen.getByText("Maria")).toBeTruthy();
  });

  it("renders phone when displayName is null", () => {
    render(<CopyablePeer displayName={null} phone="5511999999999" />);
    expect(screen.getByText("5511999999999")).toBeTruthy();
  });

  it("copies the phone number (not the displayName) when clicked", async () => {
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    const button = screen.getByRole("button", { name: /copiar telefone/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(clipboard.texts).toEqual(["5511999999999"]);
  });

  it("shows 'Copiado' feedback after a successful copy", async () => {
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copiar telefone/i }));
    });
    expect(screen.getAllByText("Copiado").length).toBeGreaterThan(0);
  });

  it("hides the feedback after 1500ms", async () => {
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copiar telefone/i }));
    });
    expect(screen.queryAllByText("Copiado").length).toBeGreaterThan(0);
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryAllByText("Copiado")).toHaveLength(0);
  });

  it("resets the hide timer when clicked again before it expires", async () => {
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    const button = screen.getByRole("button", { name: /copiar telefone/i });
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    // first timer would have fired at 1500ms from first click; restart on second click extends it.
    expect(screen.queryAllByText("Copiado").length).toBeGreaterThan(0);
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryAllByText("Copiado")).toHaveLength(0);
  });

  it("does nothing when phone is empty", async () => {
    render(<CopyablePeer displayName="Maria" phone="" />);
    const button = screen.queryByRole("button", { name: /copiar telefone/i });
    expect(button).toBeNull();
  });

  it("wraps the label in MarqueeText so long names scroll on overflow", () => {
    const { container } = render(<CopyablePeer displayName="Nome Muito Longo" phone="5511999999999" />);
    expect(container.querySelector(".marquee-container")).toBeTruthy();
  });

  it("does not show 'Copiado' when clipboard.writeText rejects", async () => {
    clipboard.rejection = new Error("clipboard unavailable");
    render(<CopyablePeer displayName="Maria" phone="5511999999999" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copiar telefone/i }));
    });
    expect(screen.queryAllByText("Copiado")).toHaveLength(0);
  });
});

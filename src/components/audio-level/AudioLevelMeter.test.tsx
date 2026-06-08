import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AudioLevelMeter } from "@/components/audio-level/AudioLevelMeter";

describe("AudioLevelMeter", () => {
  it("renders nothing when analyser is null", () => {
    const { container } = render(<AudioLevelMeter analyser={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a track and a fill child when analyser is provided", () => {
    const fake = {
      fftSize: 32,
      getByteTimeDomainData: vi.fn((buf: Uint8Array) => buf.fill(128)),
    } as unknown as AnalyserNode;
    const { container } = render(<AudioLevelMeter analyser={fake} width={120} />);
    const track = container.querySelector("[aria-hidden]") as HTMLElement | null;
    expect(track).not.toBeNull();
    expect(track?.style.width).toBe("120px");
    expect(track?.children).toHaveLength(1);
  });
});

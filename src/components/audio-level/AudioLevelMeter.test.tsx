import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AudioLevelMeter } from "@/components/audio-level/AudioLevelMeter";

describe("AudioLevelMeter", () => {
  it("renders nothing when analyser is null", () => {
    const { container } = render(<AudioLevelMeter analyser={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the configured bar count when analyser is provided", () => {
    const fake = {
      fftSize: 32,
      getByteTimeDomainData: vi.fn((buf: Uint8Array) => buf.fill(128)),
    } as unknown as AnalyserNode;
    const { container } = render(<AudioLevelMeter analyser={fake} bars={6} />);
    expect(container.querySelector("[aria-hidden]")?.children).toHaveLength(6);
  });
});

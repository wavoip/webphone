import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collectSystemInfo } from "@/lib/system-info";

describe("collectSystemInfo", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0",
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", { value: originalUserAgent, configurable: true });
    vi.unstubAllGlobals();
  });

  it("returns the current userAgent and online state", async () => {
    const info = await collectSystemInfo();
    expect(info.userAgent).toContain("Chrome/120.0.0.0");
    expect(typeof info.online).toBe("boolean");
  });

  it("returns lists of input and output audio devices", async () => {
    const devices = [
      { kind: "audioinput", deviceId: "in-1", label: "Mic", groupId: "g1" },
      { kind: "audiooutput", deviceId: "out-1", label: "Speaker", groupId: "g1" },
      { kind: "videoinput", deviceId: "cam-1", label: "Camera", groupId: "g2" },
    ];
    vi.spyOn(navigator.mediaDevices, "enumerateDevices").mockResolvedValue(devices as never);

    const info = await collectSystemInfo();
    expect(info.audioInputs).toHaveLength(1);
    expect(info.audioOutputs).toHaveLength(1);
    expect(info.audioInputs[0].deviceId).toBe("in-1");
    expect(info.audioOutputs[0].deviceId).toBe("out-1");
  });

  it("reports network connection info when navigator.connection is available", async () => {
    Object.defineProperty(navigator, "connection", {
      value: { effectiveType: "4g", downlink: 25, rtt: 50 },
      configurable: true,
    });

    const info = await collectSystemInfo();
    expect(info.network).toEqual({ effectiveType: "4g", downlinkMbps: 25, rttMs: 50 });

    delete (navigator as unknown as { connection?: unknown }).connection;
  });

  it("returns null network when navigator.connection is unavailable", async () => {
    delete (navigator as unknown as { connection?: unknown }).connection;

    const info = await collectSystemInfo();
    expect(info.network).toBeNull();
  });

  it("queries the microphone permission when permissions API is present", async () => {
    const query = vi.fn().mockResolvedValue({ state: "granted" });
    Object.defineProperty(navigator, "permissions", {
      value: { query },
      configurable: true,
    });

    const info = await collectSystemInfo();
    expect(query).toHaveBeenCalledWith({ name: "microphone" });
    expect(info.microphonePermission).toBe("granted");

    delete (navigator as unknown as { permissions?: unknown }).permissions;
  });

  it("returns 'unknown' microphone permission when query throws", async () => {
    const query = vi.fn().mockRejectedValue(new Error("not supported"));
    Object.defineProperty(navigator, "permissions", {
      value: { query },
      configurable: true,
    });

    const info = await collectSystemInfo();
    expect(info.microphonePermission).toBe("unknown");

    delete (navigator as unknown as { permissions?: unknown }).permissions;
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("audioSlice", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    store = createMiddlewareStore();
  });

  it("starts with unknown permission, empty devices, no selection", () => {
    const s = store.getState();
    expect(s.micPermission).toBe("unknown");
    expect(s.availableAudio).toEqual({ mics: [], speakers: [] });
    expect(s.selectedMicId).toBeNull();
    expect(s.selectedSpeakerId).toBeNull();
  });

  it("setMicPermission updates the cached state", () => {
    store.getState().setMicPermission("granted");
    expect(store.getState().micPermission).toBe("granted");
  });

  it("setAvailableAudio replaces the device snapshot", () => {
    const mics = [{ deviceId: "m1", kind: "audioinput" } as MediaDeviceInfo];
    const speakers = [{ deviceId: "s1", kind: "audiooutput" } as MediaDeviceInfo];
    store.getState().setAvailableAudio({ mics, speakers });
    expect(store.getState().availableAudio).toEqual({ mics, speakers });
  });

  it("setSelectedMic and setSelectedSpeaker write independently", () => {
    store.getState().setSelectedMic("mic-a");
    store.getState().setSelectedSpeaker("spk-a");
    expect(store.getState().selectedMicId).toBe("mic-a");
    expect(store.getState().selectedSpeakerId).toBe("spk-a");
  });
});

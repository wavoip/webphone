import { beforeEach, describe, expect, it } from "vitest";
import { persistAudioEffect } from "@/middleware/effects/persistAudio";
import { createMiddlewareStore, type MiddlewareStoreApi } from "@/middleware/store/createStore";

describe("persistAudioEffect", () => {
  let store: MiddlewareStoreApi;

  beforeEach(() => {
    localStorage.clear();
    store = createMiddlewareStore();
  });

  it("writes selected mic to localStorage on change", () => {
    const unsub = persistAudioEffect({ store });
    store.getState().setSelectedMic("mic-a");
    expect(JSON.parse(localStorage.getItem("wavoip:audio") ?? "{}")).toEqual({
      micId: "mic-a",
      speakerId: null,
    });
    unsub();
  });

  it("writes selected speaker to localStorage on change", () => {
    const unsub = persistAudioEffect({ store });
    store.getState().setSelectedSpeaker("spk-a");
    expect(JSON.parse(localStorage.getItem("wavoip:audio") ?? "{}")).toEqual({
      micId: null,
      speakerId: "spk-a",
    });
    unsub();
  });

  it("does not write when neither mic nor speaker changes", () => {
    const unsub = persistAudioEffect({ store });
    store.getState().setMicPermission("granted");
    expect(localStorage.getItem("wavoip:audio")).toBeNull();
    unsub();
  });
});

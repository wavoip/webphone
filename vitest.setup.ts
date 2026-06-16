import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";
import { setLanguage } from "@/lib/i18n";

setLanguage("pt-BR");

vi.stubGlobal("__WEBPHONE_VERSION__", "0.0.0-test");

// happy-dom 20 does not provide AudioContext or AudioWorkletNode; the wavoip
// SDK constructs an AudioContext during `new Wavoip(...)` so stub a minimal
// version for tests that exercise the real SDK.
class FakeAudioContext {
  audioWorklet = { addModule: async () => {} };
  destination = {};
  state = "suspended";
  createMediaStreamSource() {
    return { connect: () => {} };
  }
  suspend() {
    return Promise.resolve();
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}
Object.defineProperty(window, "AudioContext", { value: FakeAudioContext, configurable: true });
Object.defineProperty(globalThis, "AudioContext", { value: FakeAudioContext, configurable: true });

if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      enumerateDevices: async () => [],
      getUserMedia: async () => ({ getTracks: () => [], getAudioTracks: () => [] }),
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    configurable: true,
  });
}

// happy-dom 20 ships a stub localStorage without methods; supply a working one.
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

Object.defineProperty(window, "localStorage", { value: new MemoryStorage(), configurable: true });
Object.defineProperty(window, "sessionStorage", { value: new MemoryStorage(), configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: window.localStorage, configurable: true });
Object.defineProperty(globalThis, "sessionStorage", { value: window.sessionStorage, configurable: true });

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  setLanguage("pt-BR");
});

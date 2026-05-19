import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

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
});

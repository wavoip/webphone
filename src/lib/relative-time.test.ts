import { afterEach, describe, expect, it } from "vitest";
import { setLanguage } from "@/lib/i18n";
import { relativeTime } from "@/lib/relative-time";

const NOW = new Date(2026, 4, 21, 12, 0, 0);

function ago(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000);
}

describe("relativeTime", () => {
  afterEach(() => setLanguage("pt-BR"));

  describe("pt-BR (default test locale)", () => {
    it("returns 'agora' for diffs under one minute", () => {
      expect(relativeTime(ago(0), NOW)).toBe("agora");
      expect(relativeTime(ago(30), NOW)).toBe("agora");
      expect(relativeTime(ago(59), NOW)).toBe("agora");
    });

    it("returns 'Nmin' between 1 and 59 minutes", () => {
      expect(relativeTime(ago(60), NOW)).toBe("1min");
      expect(relativeTime(ago(60 * 2), NOW)).toBe("2min");
      expect(relativeTime(ago(60 * 59), NOW)).toBe("59min");
    });

    it("returns 'Nh' between 1 and 23 hours", () => {
      expect(relativeTime(ago(3600), NOW)).toBe("1h");
      expect(relativeTime(ago(3600 * 5), NOW)).toBe("5h");
      expect(relativeTime(ago(3600 * 23), NOW)).toBe("23h");
    });

    it("returns 'Nd' for one day and beyond", () => {
      expect(relativeTime(ago(86400), NOW)).toBe("1d");
      expect(relativeTime(ago(86400 * 7), NOW)).toBe("7d");
      expect(relativeTime(ago(86400 * 365), NOW)).toBe("365d");
    });

    it("clamps future dates to 'agora' instead of returning negative", () => {
      const future = new Date(NOW.getTime() + 60_000);
      expect(relativeTime(future, NOW)).toBe("agora");
    });
  });

  describe("en", () => {
    it("returns 'now' under one minute", () => {
      setLanguage("en");
      expect(relativeTime(ago(10), NOW)).toBe("now");
    });

    it("uses min/h/d suffixes", () => {
      setLanguage("en");
      expect(relativeTime(ago(120), NOW)).toBe("2min");
      expect(relativeTime(ago(7200), NOW)).toBe("2h");
      expect(relativeTime(ago(86400 * 3), NOW)).toBe("3d");
    });
  });

  describe("es", () => {
    it("returns 'ahora' under one minute", () => {
      setLanguage("es");
      expect(relativeTime(ago(10), NOW)).toBe("ahora");
    });

    it("uses min/h/d suffixes", () => {
      setLanguage("es");
      expect(relativeTime(ago(120), NOW)).toBe("2min");
      expect(relativeTime(ago(7200), NOW)).toBe("2h");
      expect(relativeTime(ago(86400 * 3), NOW)).toBe("3d");
    });
  });

  it("falls back to pt-BR when locale is unknown", () => {
    setLanguage("pt-BR");
    expect(relativeTime(ago(0), NOW)).toBe("agora");
  });

  it("defaults `now` to current time when omitted", () => {
    const result = relativeTime(new Date());
    expect(result).toBe("agora");
  });
});

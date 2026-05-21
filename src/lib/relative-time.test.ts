import { describe, expect, it } from "vitest";
import { relativeTimePt } from "@/lib/relative-time";

const NOW = new Date(2026, 4, 21, 12, 0, 0);

function ago(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000);
}

describe("relativeTimePt", () => {
  it("returns 'agora' for diffs under one minute", () => {
    expect(relativeTimePt(ago(0), NOW)).toBe("agora");
    expect(relativeTimePt(ago(30), NOW)).toBe("agora");
    expect(relativeTimePt(ago(59), NOW)).toBe("agora");
  });

  it("returns 'Nmin' between 1 and 59 minutes", () => {
    expect(relativeTimePt(ago(60), NOW)).toBe("1min");
    expect(relativeTimePt(ago(60 * 2), NOW)).toBe("2min");
    expect(relativeTimePt(ago(60 * 59), NOW)).toBe("59min");
  });

  it("returns 'Nh' between 1 and 23 hours", () => {
    expect(relativeTimePt(ago(3600), NOW)).toBe("1h");
    expect(relativeTimePt(ago(3600 * 5), NOW)).toBe("5h");
    expect(relativeTimePt(ago(3600 * 23), NOW)).toBe("23h");
  });

  it("returns 'Nd' for one day and beyond", () => {
    expect(relativeTimePt(ago(86400), NOW)).toBe("1d");
    expect(relativeTimePt(ago(86400 * 7), NOW)).toBe("7d");
    expect(relativeTimePt(ago(86400 * 365), NOW)).toBe("365d");
  });

  it("clamps future dates to 'agora' instead of returning negative", () => {
    const future = new Date(NOW.getTime() + 60_000);
    expect(relativeTimePt(future, NOW)).toBe("agora");
  });

  it("defaults `now` to current time when omitted", () => {
    const result = relativeTimePt(new Date());
    expect(result).toBe("agora");
  });
});

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { compareSemver, fetchLatestVersion, maybeUpgrade } from "./auto-update";

const PKG = "@wavoip/wavoip-webphone";
const MARKER = "data-wavoip-webphone";

function umdSrc(version: string) {
  return `https://cdn.jsdelivr.net/npm/${PKG}@${version}/dist/index.umd.min.js`;
}

// Use insertAdjacentHTML so happy-dom does not attempt to fetch and execute
// the script (parser-inserted scripts are inert per the HTML spec).
function seedLoadingScript(version: string, extra: Record<string, string> = {}) {
  const attrs = Object.entries({ ...extra, [MARKER]: version })
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  document.head.insertAdjacentHTML(
    "beforeend",
    `<script src="${umdSrc(version)}" ${attrs}></script>`,
  );
}

function fakeInject() {
  return vi.fn(async (version: string) => {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<script src="${umdSrc(version)}" ${MARKER}="${version}"></script>`,
    );
  });
}

function mockFetchJson(value: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(value), { status }));
}

describe("compareSemver", () => {
  test.each<[string, string, "lt" | "eq" | "gt"]>([
    ["1.0.0", "1.0.0", "eq"],
    ["1.4.3", "1.4.2", "gt"],
    ["1.4.2", "1.4.3", "lt"],
    ["1.10.0", "1.9.0", "gt"],
    ["2.0.0", "1.99.99", "gt"],
    ["1.5.0-beta", "1.5.0", "eq"],
    ["1.5.1-rc.1", "1.5.0", "gt"],
  ])("%s vs %s -> %s", (a, b, expected) => {
    const sign = Math.sign(compareSemver(a, b));
    const lookup = { lt: -1, eq: 0, gt: 1 } as const;
    expect(sign).toBe(lookup[expected]);
  });
});

describe("fetchLatestVersion", () => {
  afterEach(() => vi.restoreAllMocks());

  test("returns tags.latest on a 200", async () => {
    mockFetchJson({ tags: { latest: "9.9.9" } });
    expect(await fetchLatestVersion()).toBe("9.9.9");
  });

  test("returns null on a non-2xx", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 500 }));
    expect(await fetchLatestVersion()).toBeNull();
  });

  test("returns null when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    expect(await fetchLatestVersion()).toBeNull();
  });

  test("returns null when payload has no tags.latest", async () => {
    mockFetchJson({});
    expect(await fetchLatestVersion()).toBeNull();
  });
});

describe("maybeUpgrade", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });
  afterEach(() => vi.restoreAllMocks());

  test("returns null when no script tag references the package (npm consumer)", async () => {
    const inject = fakeInject();
    expect(
      await maybeUpgrade("1.0.0", {
        fetchLatest: async () => "9.9.9",
        inject,
      }),
    ).toBeNull();
    expect(inject).not.toHaveBeenCalled();
    expect(document.querySelectorAll(`script[${MARKER}]`)).toHaveLength(0);
  });

  test('returns null when data-auto-update="false" is set on the loading script', async () => {
    seedLoadingScript("1.4.2", { "data-auto-update": "false" });
    const inject = fakeInject();
    expect(
      await maybeUpgrade("1.4.2", {
        fetchLatest: async () => "9.9.9",
        inject,
      }),
    ).toBeNull();
    expect(inject).not.toHaveBeenCalled();
    const tags = document.querySelectorAll(`script[${MARKER}]`);
    expect(tags).toHaveLength(1);
    expect(tags[0].getAttribute(MARKER)).toBe("1.4.2");
  });

  test("injects newer version and removes the previous tag", async () => {
    seedLoadingScript("1.4.2");
    const inject = fakeInject();
    expect(
      await maybeUpgrade("1.4.2", {
        fetchLatest: async () => "1.4.3",
        inject,
      }),
    ).toBe("1.4.3");

    expect(inject).toHaveBeenCalledWith("1.4.3");
    const tags = Array.from(document.querySelectorAll<HTMLScriptElement>(`script[${MARKER}]`));
    expect(tags).toHaveLength(1);
    expect(tags[0].getAttribute(MARKER)).toBe("1.4.3");
    expect(tags[0].src).toBe(umdSrc("1.4.3"));
  });

  test("returns null when current version already matches latest", async () => {
    seedLoadingScript("1.4.3");
    const inject = fakeInject();
    expect(
      await maybeUpgrade("1.4.3", {
        fetchLatest: async () => "1.4.3",
        inject,
      }),
    ).toBeNull();
    expect(inject).not.toHaveBeenCalled();
  });

  test("returns null when current version is ahead of latest", async () => {
    seedLoadingScript("2.0.0");
    const inject = fakeInject();
    expect(
      await maybeUpgrade("2.0.0", {
        fetchLatest: async () => "1.4.3",
        inject,
      }),
    ).toBeNull();
    expect(inject).not.toHaveBeenCalled();
  });

  test("returns null when registry fetch returns null", async () => {
    seedLoadingScript("1.4.2");
    const inject = fakeInject();
    expect(
      await maybeUpgrade("1.4.2", {
        fetchLatest: async () => null,
        inject,
      }),
    ).toBeNull();
    expect(inject).not.toHaveBeenCalled();
  });

  test("propagates rejection when inject fails", async () => {
    seedLoadingScript("1.4.2");
    const inject = vi.fn(async () => {
      throw new Error("failed to load");
    });
    await expect(
      maybeUpgrade("1.4.2", {
        fetchLatest: async () => "1.4.3",
        inject,
      }),
    ).rejects.toThrow(/failed to load/);
  });

  test("uses the real fetchLatestVersion when no override is provided", async () => {
    seedLoadingScript("1.4.2");
    mockFetchJson({ tags: { latest: "1.4.3" } });
    const inject = fakeInject();
    expect(await maybeUpgrade("1.4.2", { inject })).toBe("1.4.3");
  });
});

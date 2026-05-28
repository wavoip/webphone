const PACKAGE_NAME = "@wavoip/wavoip-webphone";
const REGISTRY_URL = `https://data.jsdelivr.com/v1/package/npm/${PACKAGE_NAME}`;
const SCRIPT_MARKER = "data-wavoip-webphone";

type DistTags = { tags?: { latest?: string } };

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(REGISTRY_URL, { cache: "no-cache" });
    if (!res.ok) return null;
    const json: DistTags = await res.json();
    return json.tags?.latest ?? null;
  } catch {
    return null;
  }
}

function removePreviousScripts(): void {
  const selectors = [`script[${SCRIPT_MARKER}]`, `script[src*="${PACKAGE_NAME}"]`];
  for (const sel of selectors) {
    for (const node of Array.from(document.querySelectorAll(sel))) {
      node.remove();
    }
  }
}

function injectVersionedScript(version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${version}/dist/index.umd.min.js`;
    script.setAttribute(SCRIPT_MARKER, version);
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${PACKAGE_NAME}@${version}`));
    document.head.appendChild(script);
  });
}

/**
 * Check jsdelivr for a newer published version. If found, remove any
 * existing webphone <script> tags, inject the new one, and return true.
 * Caller is expected to destroy() its current instance before invoking.
 */
export async function maybeUpgrade(currentVersion: string): Promise<string | null> {
  const latest = await fetchLatestVersion();
  if (!latest) return null;
  if (compareSemver(latest, currentVersion) <= 0) return null;

  removePreviousScripts();
  await injectVersionedScript(latest);
  return latest;
}

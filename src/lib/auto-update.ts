const PACKAGE_NAME = "@wavoip/wavoip-webphone";
const REGISTRY_URL = `https://data.jsdelivr.com/v1/package/npm/${PACKAGE_NAME}`;
const SCRIPT_MARKER = "data-wavoip-webphone";
const SCRIPT_LOAD_TIMEOUT_MS = 15_000;

type DistTags = { tags?: { latest?: string } };

/**
 * Returns negative if `a` < `b`, positive if `a` > `b`, 0 if equal.
 * Strips any prerelease suffix (`-beta`, `-rc.1`) before comparing.
 */
export function compareSemver(a: string, b: string): number {
  const parse = (s: string) =>
    s
      .split("-")[0]
      .split(".")
      .map((n) => Number(n) || 0);
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(REGISTRY_URL, { cache: "no-cache" });
    if (!res.ok) return null;
    const json: DistTags = await res.json();
    return json.tags?.latest ?? null;
  } catch {
    return null;
  }
}

export function injectVersionedScript(version: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${version}/dist/index.umd.min.js`;
    script.setAttribute(SCRIPT_MARKER, version);
    script.async = false;

    const timer = window.setTimeout(() => {
      script.remove();
      reject(new Error(`timeout loading ${PACKAGE_NAME}@${version}`));
    }, SCRIPT_LOAD_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error(`failed to load ${PACKAGE_NAME}@${version}`));
    };

    document.head.appendChild(script);
  });
}

function findLoadingScript(): HTMLScriptElement | null {
  const marked = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`);
  if (marked) return marked;
  for (const s of Array.from(document.scripts)) {
    if (s.src.includes(PACKAGE_NAME)) return s;
  }
  return null;
}

// Auto-update only fires when the package was loaded via a <script> tag
// (CDN UMD). When bundled through a consumer's npm install, no such tag
// exists and we must not hijack their pinned version.
function isAutoUpdateEnabled(): boolean {
  const script = findLoadingScript();
  if (!script) return false;
  if (script.dataset.autoUpdate === "false") return false;
  return true;
}

function removeStaleScripts(except: HTMLScriptElement): void {
  const candidates = new Set<HTMLScriptElement>();
  for (const s of Array.from(document.querySelectorAll<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`))) {
    candidates.add(s);
  }
  for (const s of Array.from(document.scripts)) {
    if (s.src.includes(PACKAGE_NAME)) candidates.add(s);
  }
  candidates.delete(except);
  for (const s of candidates) s.remove();
}

export type MaybeUpgradeDeps = {
  fetchLatest?: () => Promise<string | null>;
  inject?: (version: string) => Promise<void>;
};

/**
 * If a newer version is published on jsdelivr, append a `<script>` tag for it
 * and return the new version. The caller is expected to `destroy()` the
 * current instance and re-render against the freshly loaded global before
 * relying on the upgraded build.
 *
 * Returns `null` (without DOM mutation) when:
 * - the package was not loaded via a `<script>` tag (npm consumer),
 * - `data-auto-update="false"` is set on the loading script,
 * - the registry is unreachable, or
 * - the current version already matches or exceeds the published latest.
 *
 * Rejects only when the freshly injected script fails to load or times out.
 *
 * `deps` exists so tests can swap the network fetch and the script-load step
 * without needing a real CDN or a script-loading DOM.
 */
export async function maybeUpgrade(currentVersion: string, deps: MaybeUpgradeDeps = {}): Promise<string | null> {
  if (!isAutoUpdateEnabled()) return null;

  const fetchLatest = deps.fetchLatest ?? fetchLatestVersion;
  const inject = deps.inject ?? injectVersionedScript;

  const latest = await fetchLatest();
  if (!latest) return null;
  if (compareSemver(latest, currentVersion) <= 0) return null;

  await inject(latest);
  const newest = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_MARKER}="${latest}"]`);
  if (newest) removeStaleScripts(newest);

  return latest;
}

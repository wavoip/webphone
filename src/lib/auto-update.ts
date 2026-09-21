const PACKAGE_NAME = "@wavoip/wavoip-webphone";
const REGISTRY_URL = `https://data.jsdelivr.com/v1/package/npm/${PACKAGE_NAME}`;
const SCRIPT_MARKER = "data-wavoip-webphone";
const SCRIPT_LOAD_TIMEOUT_MS = 15_000;

type DistTags = { tags?: { latest?: string } };

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

// Só quem carregou pela tag <script> (UMD da CDN) se atualiza sozinho: quem instalou
// pelo npm fixou uma versão, e ela não pode ser sequestrada.
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
 * Carregar o script novo não basta: quem chama tem que dar `destroy()` na instância
 * atual e renderizar de novo contra o global recém-carregado. Registry fora do ar dá
 * `null`, e não erro — só o script novo falhando rejeita.
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

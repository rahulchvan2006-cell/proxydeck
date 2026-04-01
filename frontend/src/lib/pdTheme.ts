const STORAGE_KEY = "pd-theme";

export type PdTheme = "light" | "dark";

export function getPdTheme(): PdTheme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setPdTheme(theme: PdTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* quota / private mode */
  }
}

export function cyclePdTheme(): PdTheme {
  const next: PdTheme = getPdTheme() === "dark" ? "light" : "dark";
  setPdTheme(next);
  return next;
}

/** For `useSyncExternalStore` when the toggle lives in React. */
export function subscribeToPdTheme(onChange: () => void): () => void {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

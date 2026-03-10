export type ThemeMode = "dark" | "light" | "reading";

const KEY = "escolazoe.theme";

export function getStoredTheme(): ThemeMode {
  const v = localStorage.getItem(KEY);
  if (v === "dark" || v === "light" || v === "reading") return v;
  return "dark";
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem(KEY, mode);
}

export function cycleTheme(current: ThemeMode): ThemeMode {
  if (current === "dark") return "light";
  if (current === "light") return "reading";
  return "dark";
}

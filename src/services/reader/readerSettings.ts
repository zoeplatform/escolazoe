export type ReaderWidth = "compact" | "comfortable" | "wide";
export type ReaderFontSize = "sm" | "md" | "lg";
export type ReaderSpacing = "normal" | "comfortable";

export type ReaderSettings = {
  width: ReaderWidth;
  fontSize: ReaderFontSize;
  spacing: ReaderSpacing;
};

const KEY = "escolazoe.reader.settings.v1";

const DEFAULTS: ReaderSettings = {
  width: "comfortable",
  fontSize: "md",
  spacing: "normal",
};

export function loadReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      width: p.width ?? DEFAULTS.width,
      fontSize: p.fontSize ?? DEFAULTS.fontSize,
      spacing: p.spacing ?? DEFAULTS.spacing,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveReaderSettings(s: ReaderSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function applyReaderSettings(s: ReaderSettings) {
  const html = document.documentElement;
  html.setAttribute("data-reader-width", s.width);
  html.setAttribute("data-reader-font", s.fontSize);
  html.setAttribute("data-reader-spacing", s.spacing);
}

import { createContext, useContext, useMemo, useState } from "react";
import { ThemeMode, applyTheme, cycleTheme, getStoredTheme } from "../services/theme/theme";

type ThemeCtx = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  nextTheme: () => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme());

  const api = useMemo<ThemeCtx>(() => ({
    theme,
    setTheme: (t) => { setThemeState(t); applyTheme(t); },
    nextTheme: () => {
      const next = cycleTheme(theme);
      setThemeState(next);
      applyTheme(next);
    }
  }), [theme]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

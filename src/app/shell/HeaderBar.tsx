import { Logo } from "../../ui/Logo";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "../../context/ThemeContext";
import { ReaderControls } from "../../ui/ReaderControls";
import type { ThemeMode } from "../../services/theme/theme";

type HeaderBarProps = {
  onMenuToggle: () => void;
  hidden?: boolean;
};

const THEME_OPTS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "dark",    label: "Escuro",  icon: "☾" },
  { mode: "light",   label: "Claro",   icon: "☀" },
  { mode: "reading", label: "Leitura", icon: "📖" },
];

const THEME_ICON: Record<ThemeMode, string> = {
  dark: "☾",
  light: "☀",
  reading: "📖",
};
const THEME_LABEL: Record<ThemeMode, string> = {
  dark: "Escuro",
  light: "Claro",
  reading: "Leitura",
};

export function HeaderBar({ onMenuToggle, hidden }: HeaderBarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className={`topHeader${hidden ? " topHeaderHidden" : ""}`}>
      <div className="topHeaderInner">
        {/* Left: hamburguer */}
        <div className="topHeaderLeft">
          <button
            className="iconBtn"
            onClick={onMenuToggle}
            aria-label="Abrir menu"
            type="button"
          >
            ☰
          </button>
        </div>

        {/* Center: Logo */}
        <div className="topHeaderCenter" aria-label="Escola Zoe">
          <Logo variant="nav" />
        </div>

        {/* Right: reader + theme */}
        <div className="topHeaderRight">
          {location.includes("/lesson/") && <ReaderControls />}

          <div className="themeMenu" ref={ref}>
            <button
              className="chipBtn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Selecionar tema"
              title="Tema"
              type="button"
            >
              <span className="chipIcon">{THEME_ICON[theme]}</span>
              <span className="chipLabel">{THEME_LABEL[theme]}</span>
              <span className="chipCaret">▾</span>
            </button>

            {open && (
              <div className="themeDropdown" role="menu" aria-label="Temas">
                {THEME_OPTS.map(({ mode, label, icon }) => (
                  <button
                    key={mode}
                    className={`themeOption${mode === theme ? " themeOptionActive" : ""}`}
                    onClick={() => { setTheme(mode); setOpen(false); }}
                    type="button"
                    role="menuitem"
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * <Logo> — componente central da marca Escola Zoe.
 *
 * FONTE DA VERDADE: para mudar nome, ícone ou tipografia da marca,
 * edite APENAS as constantes abaixo. Todos os lugares do app atualizam.
 *
 * Variantes:
 *   "nav"          — header e sidebar (compacto, horizontal)
 *   "auth"         — painel lateral das telas de auth (médio)
 *   "mobile"       — topo mobile das telas de auth
 *   "splash"       — tela de carregamento (grande, centralizado)
 *   "onboarding"   — tela de onboarding (grande, centralizado)
 *   "presentation" — tela de apresentação (grande, centralizado)
 */
import React from "react";
import { useTheme } from "../context/ThemeContext";

export const BRAND_NAME = "Escola Zoe";
export const BRAND_TAGLINE = "Aprendizado que transforma";

/**
 * Dois arquivos SVG — o sistema escala automaticamente para qualquer tamanho.
 *
 *   logo-white.svg → versão BRANCA (para tema dark, fundo escuro)
 *   logo-black.svg → versão PRETA  (para temas light e reading, fundo claro)
 *
 * Substitua cada arquivo pelo SVG final da marca na versão correspondente.
 * O componente troca automaticamente conforme o tema ativo.
 */
const ICON_WHITE = "/icons/logo-white.svg";
const ICON_BLACK = "/icons/logo-black.svg";

function resolveIconSrc(isDark: boolean): string {
  // Fundo escuro → logo branca | Fundo claro → logo preta
  return isDark ? ICON_WHITE : ICON_BLACK;
}

type LogoVariant =
  | "nav"
  | "auth"
  | "mobile"
  | "splash"
  | "onboarding"
  | "presentation";

/**
 * Tamanho do ícone por variante.
 * Regra: ícone e texto devem ter altura visual equivalente.
 *   nav          → ícone 24px  + texto 0.95rem (~15px) — compacto no header
 *   auth         → ícone 40px  + texto 1.125rem        — painel lateral
 *   mobile       → ícone 32px  + texto 1rem            — topo mobile
 *   splash       → ícone 64px  + texto 1.75rem         — loading screen
 *   onboarding   → ícone 48px  + texto 1.375rem        — slides de intro
 *   presentation → ícone 56px  + texto 1.5rem          — tela de boas-vindas
 */
const ICON_SIZE: Record<LogoVariant, number> = {
  nav:          24,
  auth:         40,
  mobile:       32,
  splash:       80,
  onboarding:   56,
  presentation: 96,
};

/** Tamanho do texto por variante — proporcional ao ícone */
const TEXT_SIZE: Record<LogoVariant, string> = {
  nav:          "0.95rem",
  auth:         "1.125rem",
  mobile:       "1rem",
  splash:       "1.875rem",
  onboarding:   "1.5rem",
  presentation: "2rem",
};

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Mostra apenas o ícone, sem o texto */
  iconOnly?: boolean;
  /** Mostra apenas o texto, sem o ícone */
  textOnly?: boolean;
}

export function Logo({
  variant = "nav",
  className = "",
  iconOnly = false,
  textOnly = false,
}: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isVertical =
    variant === "splash" ||
    variant === "onboarding" ||
    variant === "presentation";

  const rootStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: isVertical ? "column" : "row",
    gap: isVertical ? "0.75rem" : "0.5rem",
  };

  const textStyle: React.CSSProperties = {
    fontSize: TEXT_SIZE[variant],
    fontWeight: variant === "splash" ? 700 : 600,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  };

  return (
    <div
      className={`logoRoot logo--${variant} ${className}`}
      aria-label={BRAND_NAME}
      role="img"
      style={rootStyle}
    >
      {!textOnly && (
        <img
          src={resolveIconSrc(isDark)}
          alt={BRAND_NAME}
          height={ICON_SIZE[variant]}
          style={{ display: "block", height: ICON_SIZE[variant], width: "auto" }}
          draggable={false}
        />
      )}
      {!iconOnly && (
        <span className="logoBrand" style={textStyle}>
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
}

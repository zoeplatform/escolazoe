/**
 * LogoAnimada — compatibilidade retroativa.
 * Todas as páginas que importavam LogoAnimada continuam funcionando
 * sem qualquer alteração. Apenas re-exporta Logo e as constantes.
 */
export { Logo as LogoAnimada, BRAND_NAME, BRAND_TAGLINE } from "./Logo";

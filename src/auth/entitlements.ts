/**
 * Política de acesso — uso interno da comunidade.
 *
 * Todo membro autenticado tem acesso completo ao conteúdo.
 * Não há distinção entre módulos gratuitos/premium.
 */
export function canAccessModule(_moduleId: string): boolean {
  return true;
}

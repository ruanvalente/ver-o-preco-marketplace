const AUTH_NOTICES: Record<string, string> = {
  "link-invalido": "O link que você usou é inválido ou expirou. Solicite um novo.",
  "sessao-expirada": "Sua sessão expirou. Entre novamente.",
};

/**
 * Mensagens neutras exibidas a partir de parâmetros de URL.
 */
export function getAuthNotice(
  code: string | null | undefined
): string | null {
  if (!code) {
    return null;
  }

  return AUTH_NOTICES[code] ?? null;
}

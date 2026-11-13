export const DEFAULT_AUTH_REDIRECT = "/dashboard";

/**
 * Garante que o destino de um redirecionamento seja um caminho interno.
 *
 * Evita open redirect: valores externos (`https://...`), protocol-relative
 * (`//...`) ou com caracteres de controle são descartados.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 512) {
    return fallback;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\\") || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

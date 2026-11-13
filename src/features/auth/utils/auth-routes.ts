import { DEFAULT_AUTH_REDIRECT, safeRedirectPath } from "./auth-redirect";

/**
 * Rotas que exigem sessão. Novas áreas autenticadas devem ser adicionadas
 * aqui conforme os módulos forem implementados.
 */
export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/profile",
  "/listings",
] as const;

/**
 * Rotas de entrada de autenticação. Um usuário já autenticado não precisa
 * passar por elas novamente.
 *
 * `/reset-password` fica de fora de propósito: o link de recuperação cria uma
 * sessão temporária e o usuário precisa acessar a página para definir a nova
 * senha.
 */
export const AUTH_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function buildLoginPath(pathname: string, search = ""): string {
  const next = safeRedirectPath(`${pathname}${search}`);
  return `/login?next=${encodeURIComponent(next)}`;
}

type AuthRedirectInput = {
  isAuthenticated: boolean;
  pathname: string;
  search?: string;
};

/**
 * Regra única de redirecionamento otimista usada pelo proxy.
 * A autorização real continua sendo validada no servidor.
 */
export function getAuthRedirectTarget({
  isAuthenticated,
  pathname,
  search = "",
}: AuthRedirectInput): string | null {
  if (!isAuthenticated && isProtectedPath(pathname)) {
    return buildLoginPath(pathname, search);
  }

  if (isAuthenticated && isAuthPath(pathname)) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return null;
}

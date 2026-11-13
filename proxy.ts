import { type NextRequest, NextResponse } from "next/server";

import { getAuthRedirectTarget } from "@/features/auth/utils/auth-routes";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy do Next.js (antigo middleware) responsável por:
 * - renovar a sessão do Supabase;
 * - redirecionar visitantes anônimos de áreas protegidas;
 * - evitar que usuários autenticados vejam telas de entrada novamente.
 *
 * São checagens otimistas: cada página/action protegida valida a sessão
 * novamente no servidor.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const redirectTarget = getAuthRedirectTarget({
    isAuthenticated: Boolean(user),
    pathname,
    search,
  });

  if (!redirectTarget) {
    return response;
  }

  const redirectResponse = NextResponse.redirect(
    new URL(redirectTarget, request.url)
  );

  // Preserva os cookies de sessão renovados pelo Supabase.
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

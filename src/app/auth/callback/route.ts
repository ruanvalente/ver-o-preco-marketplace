import { NextResponse, type NextRequest } from "next/server"

import { exchangeCodeForSession } from "@/features/auth/services/auth.service"
import { safeRedirectPath } from "@/features/auth/utils/auth-redirect"

/**
 * Destino dos links enviados pelo Supabase Auth (confirmação de e-mail e
 * recuperação de senha). Troca o código PKCE por uma sessão válida.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"))
  const isRecovery = next === "/reset-password"

  const failurePath = isRecovery
    ? "/forgot-password?erro=link-invalido"
    : "/login?erro=link-invalido"

  if (!code) {
    return NextResponse.redirect(new URL(failurePath, request.url))
  }

  const { error } = await exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(failurePath, request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}

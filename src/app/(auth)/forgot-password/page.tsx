import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { RedirectIfAuthenticated } from "@/features/auth/components/session-gate"

export const metadata: Metadata = {
  title: "Recuperar senha | Ver-o-Preço",
  description: "Solicite um link para redefinir a senha da sua conta Ver-o-Preço.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe seu e-mail para receber um link de redefinição de senha."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <RedirectIfAuthenticated>
          <ForgotPasswordForm />
        </RedirectIfAuthenticated>
      </Suspense>
    </AuthShell>
  )
}

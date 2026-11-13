import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { FormAlert } from "@/features/auth/components/form-alert"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { getCurrentUser } from "@/features/auth/services/session.service"

export const metadata: Metadata = {
  title: "Redefinir senha | Ver-o-Preço",
  description: "Defina uma nova senha para a sua conta Ver-o-Preço.",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Redefinir senha"
      description="Escolha uma nova senha para acessar sua conta."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthShell>
  )
}

async function ResetPasswordContent() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="space-y-5">
        <FormAlert tone="error">
          O link de recuperação é inválido ou expirou. Solicite um novo link
          para continuar.
        </FormAlert>
        <Button asChild className="h-11 w-full">
          <Link href="/forgot-password">Solicitar novo link</Link>
        </Button>
      </div>
    )
  }

  return <ResetPasswordForm />
}

import Link from "next/link"
import { Check, Eye, KeyRound, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIREMENTS,
} from "../../schemas/auth.schemas"

export function NextStepPreviewCard() {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Eye aria-hidden="true" className="size-3.5" />
            Próxima Etapa (Prévia)
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Link via E-mail
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[22px]">
            Nova Senha
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Assim que abrir o e-mail autenticado pelo Supabase, você definirá
            suas novas credenciais neste formato:
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-sm font-medium">Nova senha</span>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-input px-3 text-sm tracking-widest text-muted-foreground">
              <KeyRound aria-hidden="true" className="size-4" />
              <span aria-hidden="true">••••••••</span>
              <span className="sr-only">Exemplo ilustrativo de senha</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Sua senha precisa ter:
            </p>
            <ul className="space-y-1.5">
              {PASSWORD_REQUIREMENTS.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check aria-hidden="true" className="size-3.5 shrink-0" />
                  <span>{requirement.label}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check aria-hidden="true" className="size-3.5 shrink-0" />
                <span>Máximo de {PASSWORD_MAX_LENGTH} caracteres</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Confirmar nova senha</span>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-input px-3 text-sm tracking-widest text-muted-foreground">
              <Lock aria-hidden="true" className="size-4" />
              <span aria-hidden="true">••••••••</span>
              <span className="sr-only">Exemplo ilustrativo de confirmação de senha</span>
            </div>
          </div>
          <Button asChild className="h-12 w-full gap-2 text-base font-semibold">
            <Link href="/reset-password">Já recebi o link de recuperação</Link>
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Padrão OWASP / Supabase Auth</span>
            <span>🔒 256-bit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import Link from "next/link"
import { ArrowRight, Clock, Lock, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function RecoveryStepCard() {
  return (
    <Card className="relative rounded-2xl border-border/80 shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Lock aria-hidden="true" className="size-3.5" />
            Etapa 1 de 2
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[22px]">
            Recupere o acesso à sua conta
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nesta etapa, você informa o e-mail cadastrado e enviaremos um link
            seguro para você redefinir sua senha em instantes.
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-sm font-medium">E-mail cadastrado</span>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-input px-3 text-sm text-muted-foreground">
              <Mail aria-hidden="true" className="size-4" />
              <span>seu.email@exemplo.com</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            <span>Enviaremos um token com expiração de 15 minutos via Supabase.</span>
          </div>
          <Button asChild className="h-12 w-full gap-2 text-base font-semibold">
            <Link href="/forgot-password">
              Enviar link de recuperação
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          ← Lembrou sua senha? Voltar para o Login
        </Link>
        <div className="absolute bottom-6 right-6 hidden items-center gap-1.5 rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-secondary-strong sm:flex">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Proteção Total Ver-o-Preço
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { ArrowRight, Clock, Lock, Mail, ShieldCheck } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RecoveryStepCard() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSent(true)
    }, 600)
  }

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
            Informe o e-mail cadastrado e enviaremos um link seguro para você
            redefinir sua senha em instantes.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="recovery-email">E-mail cadastrado</Label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="recovery-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                className="h-12 pl-10"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            <span>Enviaremos um token com expiração de 15 minutos via Supabase.</span>
          </div>
          <Button
            type="submit"
            className="h-12 w-full gap-2 text-base font-semibold"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {sent ? "Link enviado" : "Enviar link de recuperação"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </form>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          ← Lembrou sua senha? Voltar para o Login
        </Link>
        <div className="absolute bottom-6 right-6 hidden items-center gap-1.5 rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-[#3B7668] sm:flex">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Proteção Total Ver-o-Preço
        </div>
      </CardContent>
    </Card>
  )
}

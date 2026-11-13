import type { ReactNode } from "react"
import Link from "next/link"
import { Compass } from "lucide-react"

import { Button } from "@/components/ui/button"

import { BrandLogo } from "./brand-logo"

type LoginCardProps = {
  /** Formulário de login renderizado pelo Server Component da rota. */
  form: ReactNode
}

/**
 * Card principal da tela de login.
 *
 * O formulário é injetado como `children` para manter este componente
 * independente da camada de autenticação (Server Action / Suspense).
 */
export function LoginCard({ form }: LoginCardProps) {
  return (
    <section
      aria-labelledby="login-title"
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BrandLogo showAuthBadge />

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Compass aria-hidden="true" className="size-4" />
          Explorar catálogo
        </Link>
      </div>

      <div className="mt-8 space-y-2">
        <h1
          id="login-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Entrar na sua conta
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Acesse sua conta para anunciar, favoritar e conversar com vendedores
          da sua região.
        </p>
      </div>

      <div className="mt-6">{form}</div>

      <div className="mt-auto border-t border-border pt-6">
        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-lg text-sm font-medium"
        >
          <Link href="/register">Criar conta grátis</Link>
        </Button>
      </div>
    </section>
  )
}

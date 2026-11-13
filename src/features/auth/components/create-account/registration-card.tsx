import type { ReactNode } from "react"
import Link from "next/link"
import { Compass } from "lucide-react"

import { BrandLogo } from "../brand-logo"

type RegistrationCardProps = {
  /** Formulário renderizado pela rota, mantendo a sessão no Server Component. */
  form: ReactNode
}

/**
 * Card principal da tela de cadastro.
 *
 * O formulário é injetado como `children` para manter este componente
 * independente da camada de autenticação (Server Action / Suspense).
 */
export function RegistrationCard({ form }: RegistrationCardProps) {
  return (
    <section
      aria-labelledby="register-title"
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
          id="register-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Crie sua conta
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          É grátis e leva menos de 2 minutos. Anuncie, favorite e converse com
          gente da sua região.
        </p>
      </div>

      <div className="mt-6">{form}</div>
    </section>
  )
}

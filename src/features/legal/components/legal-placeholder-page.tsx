import Link from "next/link"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

type LegalPlaceholderPageProps = {
  /** Nome do documento, ex.: "Política de Privacidade". */
  title: string
  description: string
}

/**
 * Página provisória para documentos legais ainda não publicados.
 *
 * Evita que os links do rodapé da landing page terminem em 404 enquanto os
 * textos oficiais não são redigidos e revisados.
 */
export function LegalPlaceholderPage({
  title,
  description,
}: LegalPlaceholderPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start px-4 py-16 sm:py-20">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-xl bg-primary-muted text-primary"
      >
        <FileText className="size-6" />
      </span>

      <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>

      <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
        {description}
      </p>

      <p className="mt-6 w-full rounded-lg border border-border bg-surface-container-low p-4 text-sm leading-relaxed text-foreground">
        Este documento está em elaboração e será publicado antes do lançamento
        do marketplace.
      </p>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Voltar para a página inicial</Link>
      </Button>
    </main>
  )
}

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { trustItems } from "../../data/marketplace-content"
import { categoryToneClasses } from "../../utils/category-tone"
import { SectionHeader } from "./section-header"

/**
 * Reforço de confiança para a decisão de comprar ou vender na plataforma.
 */
export function TrustSection() {
  return (
    <section aria-labelledby="confianca-title">
      <SectionHeader
        id="confianca-title"
        title="Compre e venda com total tranquilidade"
        description="O Ver-o-Preço aproxima vizinhos e mantém a negociação simples, direta e dentro da plataforma."
        action={
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Sobre o Ver-o-Preço
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      />

      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {trustItems.map((item) => {
          const Icon = item.icon

          return (
            <li
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
            >
              <span
                aria-hidden="true"
                className={`flex size-12 items-center justify-center rounded-xl ${categoryToneClasses[item.tone]}`}
              >
                <Icon className="size-6" />
              </span>

              <div className="space-y-1.5">
                <h3 className="text-headline-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

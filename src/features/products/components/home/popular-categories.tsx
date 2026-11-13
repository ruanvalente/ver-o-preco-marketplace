import Link from "next/link"
import { ArrowRight, Tags } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { Category } from "../../types/marketplace.types"
import { categoryToneClasses } from "../../utils/category-tone"
import { formatListingCount } from "../../utils/format"
import { SectionHeader } from "./section-header"

type PopularCategoriesProps = {
  categories: Category[]
}

/**
 * Atalhos para as categorias com mais anúncios no marketplace.
 *
 * Recebe as categorias já agregadas pelo serviço de produtos, incluindo a
 * contagem de anúncios ativos.
 */
export function PopularCategories({ categories }: PopularCategoriesProps) {
  return (
    <section
      id="categorias"
      aria-labelledby="categorias-title"
      className="scroll-mt-28"
    >
      <SectionHeader
        id="categorias-title"
        title="Categorias populares"
        description="Comece pelo que você procura ou explore as categorias com mais anúncios perto de você."
        action={
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Ver catálogo completo
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
      />

      {categories.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <li key={category.id}>
                <Link
                  href={category.href}
                  className="group flex h-full flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-200 motion-safe:group-hover:scale-105 ${categoryToneClasses[category.tone]}`}
                  >
                    <Icon className="size-5" />
                  </span>

                  <span className="space-y-0.5">
                    <span className="block text-sm leading-snug font-semibold text-foreground">
                      {category.name}
                    </span>
                    <span className="block text-label-sm text-muted-foreground">
                      {formatListingCount(category.count)}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary"
          >
            <Tags className="size-7" />
          </span>
          <h3 className="mt-4 text-headline-sm font-semibold text-foreground">
            Categorias em preparação
          </h3>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Estamos organizando o catálogo por categoria. Enquanto isso, explore
            todos os anúncios disponíveis.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Explorar anúncios</Link>
          </Button>
        </div>
      )}
    </section>
  )
}

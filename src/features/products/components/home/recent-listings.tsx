import Link from "next/link"
import { ArrowRight, PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ProductSummary } from "../../types/product.types"
import { formatCount } from "../../utils/format"
import { ProductCard } from "../product-card"
import { SectionHeader } from "./section-header"

type RecentListingsProps = {
  products: ProductSummary[]
  total: number
}

/**
 * Vitrine de anúncios recém-publicados.
 *
 * Recebe os produtos já mapeados pelo serviço de produtos. A composição visual
 * é independente da origem dos dados.
 */
export function RecentListings({ products, total }: RecentListingsProps) {
  return (
    <section aria-labelledby="recentes-title">
      <div className="flex flex-col gap-4">
        <SectionHeader
          id="recentes-title"
          title="Recém-publicados em Belém e Região"
          description="Anúncios de quem está perto de você, atualizados ao longo do dia."
          action={
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {total > 0 ? `Ver todos (${formatCount(total)})` : "Explorar catálogo"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />

        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-success-surface px-3 py-1 text-label-sm font-medium text-success-strong">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-success"
          />
          Anúncios ativos agora
        </p>
      </div>

      {products.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary"
          >
            <PackageSearch className="size-7" />
          </span>
          <h3 className="mt-4 text-headline-sm font-semibold text-foreground">
            Nenhum anúncio por aqui ainda
          </h3>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Seja a primeira pessoa a publicar na sua região. Anunciar é grátis e
            leva poucos minutos.
          </p>
          <Button asChild className="mt-6">
            <Link href="/register">Anunciar produto</Link>
          </Button>
        </div>
      )}
    </section>
  )
}

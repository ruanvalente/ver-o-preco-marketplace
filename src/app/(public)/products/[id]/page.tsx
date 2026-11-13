import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"

import { ProductDetailSkeleton } from "@/features/products/components/detail/product-detail-skeleton"
import { ProductDetailView } from "@/features/products/components/detail/product-detail-view"
import { ProductErrorState } from "@/features/products/components/product-error-state"
import {
  getProductById,
  getRelatedProducts,
} from "@/features/products/services/products.service"
import { formatPrice } from "@/features/products/utils/format"
import { getCurrentUser } from "@/features/auth/services/session.service"

type ProductDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getProductById(id)

  if (!result.ok) {
    return { title: "Anúncio indisponível — Ver-o-Preço" }
  }

  if (!result.data) {
    return { title: "Anúncio não encontrado — Ver-o-Preço" }
  }

  const product = result.data
  const title = `${product.title} — Ver-o-Preço`
  const description = `${product.title} por ${formatPrice(product.price)} em ${product.location.label}. Negocie pelo chat do Ver-o-Preço.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "pt_BR",
      siteName: "Ver-o-Preço",
      type: "website",
    },
  }
}

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { id } = await params
  const result = await getProductById(id)

  if (!result.ok) {
    return <ProductErrorState message={result.error} retryHref={`/products/${id}`} />
  }

  if (!result.data) {
    notFound()
  }

  const product = result.data
  const [relatedResult, user] = await Promise.all([
    getRelatedProducts(product.category.id, product.id),
    getCurrentUser(),
  ])

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedResult.ok ? relatedResult.data : []}
      isAuthenticated={Boolean(user)}
    />
  )
}

/**
 * Detalhe público do anúncio.
 *
 * O shell mantém o link de retorno visível enquanto os dados do produto são
 * transmitidos. Produtos inexistentes ou fora do status `active` resultam em
 * 404; falhas de leitura mostram um estado de erro recuperável.
 */
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/products"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para o catálogo
      </Link>

      <div className="mt-6">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </div>
    </main>
  )
}

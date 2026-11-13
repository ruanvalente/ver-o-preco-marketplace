import { cn } from "@/lib/utils"

import type { ProductSummary } from "../types/product.types"
import { ProductCard } from "./product-card"

type ProductGridProps = {
  products: ProductSummary[]
  className?: string
}

/**
 * Grade responsiva de produtos do catálogo.
 */
export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} className="w-full" />
        </li>
      ))}
    </ul>
  )
}

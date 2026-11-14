import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import type { ChatProductContext } from "../types/chat.types"
import { formatPrice } from "@/features/products/utils/format"

export function ProductContext({ product }: { product: ChatProductContext }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex min-h-[68px] items-center gap-3 border-y bg-muted/40 px-4 py-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background text-xs text-muted-foreground">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="48px"
            unoptimized
            className="object-cover"
          />
        ) : (
          "Sem foto"
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-muted-foreground">
          Conversa sobre o anúncio
        </span>
        <span className="block truncate text-sm font-medium text-foreground">
          {product.title}
        </span>
        <span className="block text-xs font-semibold text-primary">
          {formatPrice(product.price)} · {product.location}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  )
}

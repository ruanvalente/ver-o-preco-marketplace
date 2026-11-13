"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ProductImage as ProductImageModel } from "../../types/product.types"
import { ProductImage } from "../product-image"

type ProductGalleryProps = {
  images: ProductImageModel[]
  title: string
}

/**
 * Galeria do anúncio.
 *
 * A primeira imagem é a principal. Miniaturas controlam a imagem exibida e são
 * botões nativos, portanto funcionam por teclado e leitores de tela.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0] ?? null

  if (!activeImage) {
    return (
      <div
        role="img"
        aria-label={`${title} sem imagem disponível`}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted text-muted-foreground"
      >
        <ImageOff aria-hidden="true" className="size-10" />
        <span className="text-sm">Sem imagem disponível</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <ProductImage
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.alt}
          priority={activeIndex === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul
          aria-label="Imagens do anúncio"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((image, index) => {
            const isActive = index === activeIndex

            return (
              <li key={image.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver imagem ${index + 1} de ${images.length}`}
                  aria-pressed={isActive}
                  className={cn(
                    "relative size-16 overflow-hidden rounded-lg border-2 bg-muted transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:size-20",
                    isActive
                      ? "border-primary"
                      : "border-transparent hover:border-border",
                  )}
                >
                  <ProductImage
                    src={image.url}
                    alt=""
                    sizes="80px"
                    className="object-cover"
                    fallbackVariant="compact"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

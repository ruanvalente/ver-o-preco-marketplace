"use client"

import Image from "next/image"
import { useState } from "react"
import { Eye, ImageOff, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ProductCondition } from "@/features/products/types/product.types"
import { CONDITION_LABELS } from "@/features/products/utils/catalog-options"
import { formatPrice } from "@/features/products/utils/format"

import type { ManagedListingImage } from "../hooks/use-listing-images"

type ListingPreviewProps = {
  title: string
  description: string
  categoryName: string | null
  condition: ProductCondition | ""
  price: number | null
  city: string
  neighborhood: string
  images: ManagedListingImage[]
}

function buildLocationLabel(city: string, neighborhood: string): string {
  const trimmedCity = city.trim()
  const trimmedNeighborhood = neighborhood.trim()

  if (trimmedCity && trimmedNeighborhood) {
    return `${trimmedCity} - ${trimmedNeighborhood}`
  }

  return trimmedCity || "Localização não informada"
}

/**
 * Prévia do anúncio no formato do catálogo público.
 *
 * Usa o estado atual do formulário (antes de salvar), incluindo imagens que
 * ainda estão em object URL, por isso as imagens são renderizadas sem
 * otimização. O diálogo é apenas leitura e não altera nenhum dado.
 */
export function ListingPreview({
  title,
  description,
  categoryName,
  condition,
  price,
  city,
  neighborhood,
  images,
}: ListingPreviewProps) {
  const [open, setOpen] = useState(false)
  const primaryImage =
    images.find((image) => image.isPrimary) ?? images[0] ?? null
  const imageAlt = primaryImage?.altText.trim() || title || "Imagem do anúncio"
  const locationLabel = buildLocationLabel(city, neighborhood)
  const conditionLabel = condition
    ? CONDITION_LABELS[condition]
    : "Condição não informada"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Eye aria-hidden="true" className="size-4" />
          Pré-visualizar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévia do anúncio</DialogTitle>
          <DialogDescription>
            É assim que seu anúncio aparece no catálogo depois de publicado.
          </DialogDescription>
        </DialogHeader>

        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-[4/3] bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={imageAlt}
                fill
                unoptimized
                sizes="(min-width: 640px) 640px, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                role="img"
                aria-label="Anúncio sem imagem disponível"
                className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImageOff aria-hidden="true" className="size-8" />
                <span className="text-label-sm">Sem imagem</span>
              </div>
            )}

            <Badge
              variant="outline"
              className="absolute top-3 left-3 border-transparent bg-card/95 px-2.5 py-1 text-badge-label text-foreground shadow-card backdrop-blur-sm"
            >
              {conditionLabel}
            </Badge>
          </div>

          {images.length > 1 ? (
            <ul
              aria-label="Imagens do anúncio"
              className="flex gap-2 overflow-x-auto border-b border-border p-3"
            >
              {images.map((image, index) => (
                <li
                  key={image.id}
                  className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={`${imageAlt} ${index + 1}`}
                      width={56}
                      height={56}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageOff aria-hidden="true" className="size-4" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="space-y-2 p-4">
            {categoryName ? (
              <p className="text-label-sm text-muted-foreground">
                {categoryName}
              </p>
            ) : null}

            <p className="text-price-display text-primary">
              {price !== null ? formatPrice(price) : "Preço não informado"}
            </p>

            <h3 className="text-headline-sm leading-snug font-semibold text-foreground">
              {title.trim() || "Título do anúncio"}
            </h3>

            <p className="flex items-center gap-1.5 text-label-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span>{locationLabel}</span>
            </p>

            {description.trim() ? (
              <p className="text-pretty text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {description.trim()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem descrição. Adicione detalhes para ajudar os compradores.
              </p>
            )}
          </div>
        </article>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar prévia
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

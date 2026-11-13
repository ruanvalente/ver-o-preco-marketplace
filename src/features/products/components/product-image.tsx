"use client"

import Image from "next/image"
import { ImageOff } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type ProductImageProps = {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  fallbackVariant?: "default" | "compact"
}

/**
 * Imagem de produto com fallback.
 *
 * O `next/image` não substitui automaticamente imagens que respondem 404 ou
 * falham no upstream. Este componente detecta o erro e troca a imagem por um
 * placeholder consistente com o estado "sem imagem" do catálogo.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  fallbackVariant = "default",
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  // Comparar com a `src` atual evita manter o fallback quando a imagem muda.
  if (failedSrc === src) {
    const isDecorative = alt.length === 0

    return (
      <div
        role={isDecorative ? undefined : "img"}
        aria-label={isDecorative ? undefined : `${alt} indisponível`}
        aria-hidden={isDecorative ? true : undefined}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
      >
        <ImageOff
          aria-hidden="true"
          className={cn(fallbackVariant === "compact" ? "size-4" : "size-8")}
        />
        {fallbackVariant === "default" && (
          <span className="text-label-sm">Sem imagem</span>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  )
}

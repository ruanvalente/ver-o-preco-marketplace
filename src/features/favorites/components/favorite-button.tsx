"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  productId: string;
  productTitle: string;
  className?: string;
};

/**
 * Ação de favoritar no card de produto.
 *
 * O estado local mantém a interação de UI enquanto o módulo de favoritos não
 * está integrado ao Supabase. A persistência pertence ao service/hook da
 * feature `favorites`.
 */
export function FavoriteButton({
  productId,
  productTitle,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Remover ${productTitle} dos favoritos`
          : `Adicionar ${productTitle} aos favoritos`
      }
      data-product-id={productId}
      onClick={() => setIsFavorite((current) => !current)}
      className={cn(
        "size-11 rounded-full border border-border bg-card/95 text-foreground shadow-card backdrop-blur-sm hover:bg-card",
        isFavorite && "text-primary",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-5", isFavorite && "fill-current")}
      />
    </Button>
  );
}

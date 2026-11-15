import { Heart } from "lucide-react";

import { ProductGrid } from "@/features/products/components/product-grid";
import { formatCount } from "@/features/products/utils/format";
import type { FavoriteCollection } from "../types/favorite.types";

import { FavoriteEmptyState } from "./favorite-empty-state";
import { FavoriteErrorState } from "./favorite-error-state";

type FavoritesPageProps = {
  result: { ok: true; data: FavoriteCollection } | { ok: false; error: string };
};

export function FavoritesPage({ result }: FavoritesPageProps) {
  return (
    <div className="mx-auto w-full max-w-330 space-y-8">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Heart aria-hidden="true" className="size-4" />
          Sua coleção
        </p>
        <h1 className="text-balance text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
          Meus favoritos
        </h1>
        {result.ok && result.data.products.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {formatCount(result.data.products.length)}{" "}
            {result.data.products.length === 1
              ? "anúncio salvo"
              : "anúncios salvos"}{" "}
            para ver depois.
          </p>
        ) : null}
      </header>

      {!result.ok ? (
        <FavoriteErrorState message={result.error} />
      ) : result.data.products.length > 0 ? (
        <>
          {result.data.unavailableCount > 0 ? (
            <p role="status" className="text-sm text-muted-foreground">
              {formatCount(result.data.unavailableCount)}{" "}
              {result.data.unavailableCount === 1
                ? "anúncio salvo não está disponível"
                : "anúncios salvos não estão disponíveis"}{" "}
              no momento.
            </p>
          ) : null}
          <ProductGrid
            products={result.data.products}
            favoriteProductIds={result.data.products.map(
              (product) => product.id,
            )}
            favoriteRedirectTo="/favorites"
          />
        </>
      ) : (
        <FavoriteEmptyState unavailableCount={result.data.unavailableCount} />
      )}
    </div>
  );
}

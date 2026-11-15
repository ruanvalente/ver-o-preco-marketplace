"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildLoginPath } from "@/features/auth/utils/auth-routes";
import { cn } from "@/lib/utils";
import { setFavoriteAction } from "../services/favorites.actions";

type FavoriteButtonProps = {
  productId: string;
  productTitle: string;
  isFavorite?: boolean;
  redirectTo?: string;
  className?: string;
};

export function FavoriteButton({
  productId,
  productTitle,
  isFavorite: initialIsFavorite = false,
  redirectTo = `/products/${productId}`,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function toggleFavorite() {
    if (isPending) {
      return;
    }

    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);
    setIsPending(true);
    setErrorMessage("");

    try {
      const result = await setFavoriteAction(productId, nextIsFavorite);

      if (!result.ok) {
        setIsFavorite(!nextIsFavorite);

        if (result.reason === "unauthenticated") {
          router.push(buildLoginPath(redirectTo));
          return;
        }

        setErrorMessage(result.message);
        toast.error(result.message);
      }
    } catch {
      setIsFavorite(!nextIsFavorite);
      const message =
        "Não foi possível atualizar este favorito. Tente novamente.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }

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
      aria-busy={isPending}
      data-product-id={productId}
      onClick={toggleFavorite}
      disabled={isPending}
      className={cn(
        "size-11 rounded-full border border-border bg-card/95 text-foreground shadow-card backdrop-blur-sm hover:bg-card",
        isFavorite && "text-primary",
        className,
      )}
    >
      {isPending ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin motion-reduce:animate-none"
        />
      ) : (
        <Heart
          aria-hidden="true"
          className={cn("size-5", isFavorite && "fill-current")}
        />
      )}
      <span role="status" className="sr-only">
        {isPending
          ? isFavorite
            ? "Salvando favorito…"
            : "Removendo favorito…"
          : errorMessage}
      </span>
    </Button>
  );
}

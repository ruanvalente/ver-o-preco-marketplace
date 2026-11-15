import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { requireUser } from "@/features/auth/services/session.service";
import { FavoritesPage } from "@/features/favorites/components/favorites-page";
import { FavoritesSkeleton } from "@/features/favorites/components/favorites-skeleton";
import { getFavoriteProducts } from "@/features/favorites/services/favorites.service";

export const metadata: Metadata = {
  title: "Meus favoritos | Ver-o-Preço",
};

export default function FavoritesRoute() {
  return (
    <main className="mx-auto w-full max-w-330 flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesContent />
      </Suspense>
    </main>
  );
}

async function FavoritesContent() {
  await connection();
  const user = await requireUser("/favorites");
  const result = await getFavoriteProducts(user.id);

  return <FavoritesPage result={result} />;
}

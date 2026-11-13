import type { Metadata } from "next"
import { Suspense } from "react"
import { connection } from "next/server"

import { requireUser } from "@/features/auth/services/session.service"
import { ListingEditor } from "@/features/listings/components/listing-editor"
import { ListingFormSkeleton } from "@/features/listings/components/listing-form-skeleton"

export const metadata: Metadata = {
  title: "Novo anúncio | Ver-o-Preço",
}

export default function NewListingRoute() {
  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Suspense fallback={<ListingFormSkeleton />}>
        <NewListingContent />
      </Suspense>
    </main>
  )
}

async function NewListingContent() {
  await connection()
  const user = await requireUser("/listings/new")

  return <ListingEditor mode="create" userId={user.id} />
}

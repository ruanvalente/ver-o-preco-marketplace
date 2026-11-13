import type { Metadata } from "next"
import { Suspense } from "react"
import { connection } from "next/server"

import { requireUser } from "@/features/auth/services/session.service"
import { ListingEditor } from "@/features/listings/components/listing-editor"
import { ListingFormSkeleton } from "@/features/listings/components/listing-form-skeleton"

export const metadata: Metadata = {
  title: "Editar anúncio | Ver-o-Preço",
}

type EditListingRouteProps = {
  params: Promise<{ id: string }>
}

export default function EditListingRoute({ params }: EditListingRouteProps) {
  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Suspense fallback={<ListingFormSkeleton />}>
        <EditListingContent params={params} />
      </Suspense>
    </main>
  )
}

async function EditListingContent({ params }: EditListingRouteProps) {
  await connection()
  const { id } = await params
  const user = await requireUser(`/listings/${id}/edit`)

  return <ListingEditor mode="edit" userId={user.id} listingId={id} />
}

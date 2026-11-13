import type { Metadata } from "next"
import { Suspense } from "react"
import { connection } from "next/server"

import { Skeleton } from "@/components/ui/skeleton"
import { requireUser } from "@/features/auth/services/session.service"
import { ListingsPage } from "@/features/listings/components/listings-page"

export const metadata: Metadata = {
  title: "Meus anúncios | Ver-o-Preço",
}

type ListingsRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default function ListingsRoute({ searchParams }: ListingsRouteProps) {
  return (
    <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function ListingsContent({ searchParams }: ListingsRouteProps) {
  await connection()
  const user = await requireUser("/listings")
  const params = await searchParams

  return (
    <ListingsPage
      userId={user.id}
      feedback={{
        created: firstValue(params.created),
        updated: firstValue(params.updated),
        deleted: firstValue(params.deleted),
        error: firstValue(params.error),
      }}
    />
  )
}

function ListingsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando seus anúncios…
      </span>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
}

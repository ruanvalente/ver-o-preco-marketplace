import type { Metadata } from "next"
import { Suspense } from "react"
import { connection } from "next/server"

import { Skeleton } from "@/components/ui/skeleton"
import { requireUser } from "@/features/auth/services/session.service"
import { ProfilePage } from "@/features/profile/components/profile-page"

export const metadata: Metadata = {
  title: "Meu perfil | Ver-o-Preço",
}

export default function ProfileRoute() {
  return (
    <main className="flex w-full flex-1">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </main>
  )
}

async function ProfileContent() {
  await connection()
  const user = await requireUser("/profile")

  return <ProfilePage userId={user.id} />
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando perfil…
      </span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

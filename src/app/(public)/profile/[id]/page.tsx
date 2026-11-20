import type { Metadata } from "next"
import { PublicProfilePage } from "@/features/profile/components/public-profile-page"

type ProfilePageProps = {
  params: Promise<{ id: string }>
}

export function generateMetadata(): Metadata {
  return {
    title: "Perfil | Ver-o-Preço",
  }
}

export default async function PublicProfileRoute({ params }: ProfilePageProps) {
  const { id } = await params
  return <PublicProfilePage userId={id} />
}

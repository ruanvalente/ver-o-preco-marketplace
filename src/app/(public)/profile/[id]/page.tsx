import type { Metadata } from "next"
import { PublicProfilePage } from "@/features/profile/components/public-profile-page"

type ProfilePageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: "Perfil | Ver-o-Preço",
  }
}

export default async function PublicProfileRoute({ params }: ProfilePageProps) {
  const { id } = await params
  return <PublicProfilePage userId={id} />
}

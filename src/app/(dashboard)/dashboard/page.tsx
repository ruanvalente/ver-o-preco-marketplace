import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { ArrowRight, Heart, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { requireUser } from "@/features/auth/services/session.service"

export const metadata: Metadata = {
  title: "Minha conta | Ver-o-Preço",
}

/**
 * Área autenticada mínima criada na fase de autenticação.
 * O dashboard completo pertence ao módulo `dashboard` (fase 7).
 */
export default function DashboardPage() {
  return (
    <main className="container mx-auto flex w-full flex-1 px-4 py-10">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  )
}

async function DashboardContent() {
  await connection()
  const user = await requireUser("/dashboard")

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
        <p className="text-sm text-muted-foreground">
          {user.email
            ? `Você está conectado como ${user.email}.`
            : "Você está conectado."}
        </p>
      </header>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Seus anúncios</h2>
        <p className="text-sm text-muted-foreground">
          Crie, edite, publique e pause os produtos que você está vendendo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/listings/new">
              <Plus aria-hidden="true" className="size-4" />
              Criar anúncio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/listings">
              Meus anúncios
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/favorites">
              <Heart aria-hidden="true" className="size-4" />
              Meus favoritos
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/profile">Meu perfil</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Conversas em desenvolvimento</h2>
        <p className="text-sm text-muted-foreground">
          Em breve você poderá conversar com vendedores por aqui. Enquanto isso,
          explore os anúncios disponíveis.
        </p>
        <LogoutButton />
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6" aria-busy="true">
      <span role="status" className="sr-only">
        Carregando sua conta…
      </span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

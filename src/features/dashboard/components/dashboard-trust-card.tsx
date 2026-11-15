import { ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function DashboardTrustCard() {
  return (
    <Card className="gap-4 bg-secondary-muted/50 py-5 shadow-none">
      <CardContent className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-secondary">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="font-semibold">Confiança se constrói na conversa</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            O Ver-o-Preço ainda não calcula níveis ou notas de vendedores.
            Mantenha seu perfil atualizado e combine os detalhes pelo chat.
          </p>
        </div>
        <span className="w-fit rounded-full border border-secondary/20 bg-card px-3 py-1.5 text-xs font-medium text-secondary-strong">
          Sem nota calculada
        </span>
      </CardContent>
    </Card>
  )
}

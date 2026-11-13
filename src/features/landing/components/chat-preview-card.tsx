import { ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

type ChatPreviewCardProps = {
  className?: string
}

export function ChatPreviewCard({ className }: ChatPreviewCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[17rem] rounded-xl border border-border bg-card p-4 shadow-popover",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary">
          <ShieldCheck aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Chat Seguro</p>
          <p className="text-badge-label text-success-strong">
            Conversa protegida
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="w-fit max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-xs leading-relaxed text-foreground">
          Oi! A bicicleta ainda está disponível?
        </p>
        <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground">
          Está sim! Podemos combinar no centro de Belém?
        </p>
      </div>

      <p className="mt-3 text-right text-badge-label text-muted-foreground">
        Enviado agora · Lido
      </p>
    </div>
  )
}

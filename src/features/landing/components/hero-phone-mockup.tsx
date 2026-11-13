import {
  Bike,
  Home,
  MessageCircle,
  Plus,
  Search,
  Smartphone,
  Sofa,
  Store,
  UserRound,
  Wifi,
  BatteryFull,
  Signal,
} from "lucide-react"

import { cn } from "@/lib/utils"

type PhoneMockupProps = {
  className?: string
}

/**
 * Representação visual do app dentro da landing page.
 *
 * É um mockup estático (sem interação) construído com HTML e Tailwind. O
 * componente pai deve envolvê-lo em um `role="img"` com descrição textual.
 */
export function PhoneMockup({ className }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[17.5rem] rounded-[2.75rem] border border-border bg-card p-2.5 shadow-modal sm:max-w-[19rem]",
        className
      )}
    >
      <div className="overflow-hidden rounded-[2.25rem] border border-border bg-background">
        <div className="flex h-[30rem] flex-col">
          <div className="flex items-center justify-between px-5 pt-3 text-badge-label font-semibold text-foreground">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Signal aria-hidden="true" className="size-3" />
              <Wifi aria-hidden="true" className="size-3" />
              <BatteryFull aria-hidden="true" className="size-3.5" />
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between px-5">
            <span className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm font-bold tracking-tight text-primary">
                Ver-o-Preço
              </span>
            </span>
            <span
              aria-hidden="true"
              className="size-7 rounded-full bg-surface-container"
            />
          </div>

          <div className="mt-4 px-5">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <Search aria-hidden="true" className="size-3.5" />
              Buscar no seu bairro
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-5">
            <span className="text-xs font-semibold text-foreground">
              Perto de você
            </span>
            <span className="text-badge-label font-medium text-primary">
              Ver todos
            </span>
          </div>

          <div className="mt-2 space-y-2 px-5">
            <div className="flex gap-2.5 rounded-xl border border-border bg-card p-2.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary-muted text-secondary-strong">
                <Bike aria-hidden="true" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  Bicicleta aro 29
                </span>
                <span className="mt-0.5 block text-sm font-bold text-primary">
                  R$ 850
                </span>
                <span className="mt-0.5 block text-badge-label text-muted-foreground">
                  Belém · Usada
                </span>
              </span>
            </div>

            <div className="flex gap-2.5 rounded-xl border border-border bg-card p-2.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
                <Sofa aria-hidden="true" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  Sofá 3 lugares
                </span>
                <span className="mt-0.5 block text-sm font-bold text-primary">
                  R$ 420
                </span>
                <span className="mt-0.5 block text-badge-label text-muted-foreground">
                  Ananindeua · Usado
                </span>
              </span>
            </div>

            <div className="flex gap-2.5 rounded-xl border border-border bg-card p-2.5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-success-surface text-success-strong">
                <Smartphone aria-hidden="true" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  Celular seminovo
                </span>
                <span className="mt-0.5 block text-sm font-bold text-primary">
                  R$ 1.150
                </span>
                <span className="mt-0.5 block text-badge-label text-muted-foreground">
                  Castanhal · Usado
                </span>
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-around border-t border-border bg-card px-5 py-3 text-muted-foreground">
            <Home aria-hidden="true" className="size-4 text-primary" />
            <Search aria-hidden="true" className="size-4" />
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus aria-hidden="true" className="size-4" />
            </span>
            <MessageCircle aria-hidden="true" className="size-4" />
            <UserRound aria-hidden="true" className="size-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

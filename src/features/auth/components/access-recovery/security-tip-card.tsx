import { Globe } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function SecurityTipCard() {
  return (
    <Card className="rounded-2xl border-border/80 bg-[#EEF0FF] shadow-none">
      <CardContent className="flex flex-col gap-3 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-white/80 text-primary">
            <Globe aria-hidden="true" className="size-4" />
          </span>
          <div className="space-y-2">
            <h3 className="text-base font-semibold">
              Dica de Segurança para o Vendedor Paraense
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nunca informe códigos SMS ou tokens de e-mail a intermediários em
              feiras ou pontos de entrega de Belém e cidades do interior. O
              suporte oficial Ver-o-Preço jamais solicita suas senhas.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

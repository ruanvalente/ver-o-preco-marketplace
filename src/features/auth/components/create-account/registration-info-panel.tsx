import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { REGISTRATION_BENEFITS } from "../../data/register-content"
import { MarketplaceFeature } from "../marketplace-feature"
import { RegistrationPrivacyCard } from "./registration-privacy-card"
import { RegistrationStats } from "./registration-stats"

/**
 * Painel institucional exibido ao lado do cadastro em telas largas.
 * Em viewports menores ele continua visível abaixo do formulário.
 */
export function RegistrationInfoPanel() {
  return (
    <section
      aria-labelledby="registration-info-title"
      className="flex h-full flex-col rounded-2xl border border-card/70 bg-linear-to-br from-primary-muted via-accent to-secondary-muted p-6 shadow-card sm:p-8 lg:p-10"
    >
      <Badge
        variant="outline"
        className="w-fit gap-1.5 border-transparent bg-card px-3 py-1 font-semibold text-primary shadow-card"
      >
        <MapPin aria-hidden="true" className="size-3.5" />
        Feito no Pará, para o Pará
      </Badge>

      <h2
        id="registration-info-title"
        className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
      >
        Compre e venda com quem está perto de você.
      </h2>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        O Ver-o-Preço conecta vizinhos, empreendedores e histórias do Pará em uma
        praça digital simples, local e segura.
      </p>

      <div className="mt-8">
        <RegistrationStats />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Por que criar sua conta?
        </h3>

        <ul className="mt-4 space-y-5">
          {REGISTRATION_BENEFITS.map((benefit) => (
            <MarketplaceFeature key={benefit.title} feature={benefit} />
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-8">
        <RegistrationPrivacyCard />
      </div>
    </section>
  )
}

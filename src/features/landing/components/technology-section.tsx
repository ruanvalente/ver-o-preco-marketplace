import { Database } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { technologyFeatures } from "../data/landing-content"

import { FeatureCard } from "./shared/feature-card"
import { Section } from "./shared/section"
import { SectionHeader } from "./shared/section-header"

export function TechnologySection() {
  return (
    <Section id="experiencia" labelledBy="technology-title">
      <SectionHeader
        id="technology-title"
        eyebrow="Experiência"
        title="Construído com tecnologia de classe mundial"
        description="Uma base moderna e segura para que comprar e vender no Pará seja tão simples quanto mandar uma mensagem."
      >
        <Badge
          variant="outline"
          className="mt-2 gap-1.5 border-border bg-card px-3 py-1 text-label-sm font-medium text-muted-foreground"
        >
          <Database aria-hidden="true" className="size-3.5 text-primary" />
          Tecnologia Supabase + proteção de dados
        </Badge>
      </SectionHeader>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
        {technologyFeatures.map((item) => (
          <FeatureCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            tone={item.tone}
            badge={item.badge}
          />
        ))}
      </div>
    </Section>
  )
}

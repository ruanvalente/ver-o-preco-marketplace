import { valuePropositions } from "../data/landing-content"

import { FeatureCard } from "./shared/feature-card"
import { Section } from "./shared/section"
import { SectionHeader } from "./shared/section-header"

export function ValuePropositionSection() {
  return (
    <Section id="solucao" labelledBy="value-proposition-title">
      <SectionHeader
        id="value-proposition-title"
        eyebrow="A nossa proposta"
        title="Uma praça digital moderna, justa e 100% focada no comércio local"
        description="O que você precisa para vender e comprar com confiança, sem abrir mão do lucro nem da sua privacidade."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
        {valuePropositions.map((item) => (
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

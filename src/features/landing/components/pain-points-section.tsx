import { painPoints } from "../data/landing-content"

import { FeatureCard } from "./shared/feature-card"
import { Section } from "./shared/section"
import { SectionHeader } from "./shared/section-header"

export function PainPointsSection() {
  return (
    <Section labelledBy="pain-points-title">
      <SectionHeader
        id="pain-points-title"
        eyebrow="O problema"
        title="Vender e comprar localmente costumava ser complicado"
        description="Grupos de mensagem, taxas escondidas e anúncios que nunca chegam a quem está perto. O Ver-o-Preço nasceu para mudar isso."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
        {painPoints.map((item) => (
          <FeatureCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            tone={item.tone}
            link={item.link}
          />
        ))}
      </div>
    </Section>
  )
}

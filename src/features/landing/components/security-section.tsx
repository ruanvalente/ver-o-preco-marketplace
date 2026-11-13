import { securityFeatures } from "../data/landing-content"

import { FeatureCard } from "./shared/feature-card"
import { Section } from "./shared/section"
import { SectionHeader } from "./shared/section-header"

export function SecuritySection() {
  return (
    <Section id="seguranca" labelledBy="security-title">
      <SectionHeader
        id="security-title"
        eyebrow="Segurança"
        title="Segurança de dados e negociações conscientes"
        description="Tecnologia para proteger sua conta e boas práticas para encontros mais tranquilos. O resto é conversa no chat."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
        {securityFeatures.map((item) => (
          <FeatureCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>
    </Section>
  )
}

import { howItWorksSteps } from "../data/landing-content"

import { Section } from "./shared/section"
import { SectionHeader } from "./shared/section-header"
import { StepCard } from "./shared/step-card"

export function HowItWorksSection() {
  return (
    <Section
      id="como-funciona"
      labelledBy="how-it-works-title"
      className="border-y border-border bg-surface-container-low"
    >
      <SectionHeader
        id="how-it-works-title"
        eyebrow="Como funciona"
        title="Simples do primeiro clique até a entrega"
        description="Quatro passos para transformar o que está parado em uma boa conversa — e, quem sabe, em uma venda."
      />

      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <li key={step.title} className="h-full">
            <StepCard
              step={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          </li>
        ))}
      </ol>
    </Section>
  )
}

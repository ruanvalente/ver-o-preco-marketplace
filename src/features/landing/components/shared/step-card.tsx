import type { LucideIcon } from "lucide-react"

import { IconTile } from "./icon-tile"

type StepCardProps = {
  step: number
  title: string
  description: string
  icon: LucideIcon
}

export function StepCard({ step, title, description, icon }: StepCardProps) {
  const formattedStep = String(step).padStart(2, "0")

  return (
    <article className="relative flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={icon} tone="primary" />
        <span
          aria-hidden="true"
          className="text-4xl font-extrabold leading-none tracking-tight text-primary/15"
        >
          {formattedStep}
        </span>
      </div>

      <p className="mt-5 text-label-sm font-semibold uppercase tracking-[0.14em] text-primary">
        Passo {formattedStep}
      </p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  )
}

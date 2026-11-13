import type { MarketplaceHighlight } from "../data/login-content"

type MarketplaceFeatureProps = {
  feature: MarketplaceHighlight
}

export function MarketplaceFeature({ feature }: MarketplaceFeatureProps) {
  const Icon = feature.icon

  return (
    <li className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-card">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </li>
  )
}

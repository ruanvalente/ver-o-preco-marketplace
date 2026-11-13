import Link from "next/link"

import { REGISTRATION_PRIVACY } from "../../data/register-content"

export function RegistrationPrivacyCard() {
  const Icon = REGISTRATION_PRIVACY.icon

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-surface text-success-strong">
          <Icon aria-hidden="true" className="size-5" />
        </span>

        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground">
            {REGISTRATION_PRIVACY.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {REGISTRATION_PRIVACY.description}
          </p>
          <Link
            href={REGISTRATION_PRIVACY.linkHref}
            className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {REGISTRATION_PRIVACY.linkLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

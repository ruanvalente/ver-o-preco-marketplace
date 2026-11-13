import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  id?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Cabeçalho compartilhado pelas seções da home.
 */
export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        <h2
          id={id}
          className="text-headline-lg-mobile font-bold tracking-tight text-foreground text-balance sm:text-headline-lg"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

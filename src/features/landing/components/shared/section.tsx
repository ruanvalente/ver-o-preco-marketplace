import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionProps = {
  id?: string
  labelledBy?: string
  className?: string
  containerClassName?: string
  children: ReactNode
}

/**
 * Estrutura base das seções da landing page.
 *
 * Centraliza container, padding horizontal e ritmo vertical para que todas as
 * seções compartilhem o mesmo grid sem repetir medidas.
 */
export function Section({
  id,
  labelledBy,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-24 py-16 sm:py-20 lg:py-28", className)}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

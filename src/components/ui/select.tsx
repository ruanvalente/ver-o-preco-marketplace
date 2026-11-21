import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Select nativo compartilhado: preserva teclado, leitor de tela e o seletor do
 * sistema no mobile, e funciona em formulários GET sem JavaScript.
 */
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-base text-foreground shadow-xs outline-hidden transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Select }

import * as React from "react"
import { ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AuthSelectProps = Omit<React.ComponentProps<"select">, "id"> & {
  id: string
  label: string
  error?: string
  hint?: string
  placeholder: string
  options: readonly string[]
  /** Ícone decorativo exibido à esquerda do campo. */
  icon?: LucideIcon
}

/**
 * Select nativo com o mesmo padrão visual e de acessibilidade dos inputs de
 * autenticação. O elemento nativo preserva teclado, leitor de tela e o
 * seletor do sistema no mobile.
 */
export function AuthSelect({
  id,
  label,
  error,
  hint,
  placeholder,
  options,
  icon: Icon,
  className,
  ...props
}: AuthSelectProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : null}

        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full appearance-none rounded-lg border border-input bg-surface-container-low py-2 pr-10 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            Icon ? "pl-10" : "pl-3",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

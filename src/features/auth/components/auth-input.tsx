import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AuthInputProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  id: string
  label: string
  error?: string
  hint?: string
  /** ID de uma descrição externa (ex.: requisitos da senha). */
  descriptionId?: string
  /** Ícone decorativo exibido à esquerda do campo. */
  icon?: LucideIcon
  /** Ação opcional alinhada à direita do label (ex.: "Esqueceu a senha?"). */
  labelAction?: React.ReactNode
  /** Elemento interativo exibido à direita do campo (ex.: mostrar senha). */
  endAdornment?: React.ReactNode
}

/**
 * Campo de formulário de autenticação com label explícito, dica opcional e
 * mensagem de erro associada ao input.
 */
export function AuthInput({
  id,
  label,
  error,
  hint,
  descriptionId,
  icon: Icon,
  labelAction,
  endAdornment,
  className,
  ...props
}: AuthInputProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [
      descriptionId ?? null,
      hint ? hintId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : null}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11",
            Icon && "pl-10",
            endAdornment && "pr-12",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            {endAdornment}
          </div>
        ) : null}
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

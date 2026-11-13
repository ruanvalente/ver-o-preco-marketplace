import type { ReactNode } from "react"

type ConsentCheckboxProps = {
  id: string
  name: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  required?: boolean
  children: ReactNode
}

/**
 * Consentimento com label clicável e erro associado ao input.
 * O label mantém uma área de toque confortável mesmo com o checkbox nativo.
 */
export function ConsentCheckbox({
  id,
  name,
  checked,
  onCheckedChange,
  error,
  required = false,
  children,
}: ConsentCheckboxProps) {
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          required={required}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-2.5 size-5 shrink-0 cursor-pointer rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />

        <label
          htmlFor={id}
          className="cursor-pointer py-2.5 text-sm leading-6 text-muted-foreground"
        >
          {children}
        </label>
      </div>

      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

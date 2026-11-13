import { cn } from "@/lib/utils"

type PasswordStrengthProps = {
  value: string
}

function getStrength(value: string) {
  if (!value) return { level: 0, label: "Fraca" }
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  if (score <= 1) return { level: 1, label: "Fraca" }
  if (score === 2 || score === 3) return { level: 2, label: "Média" }
  return { level: 3, label: "Forte (Recomendado)" }
}

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const strength = getStrength(value)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Força da senha</span>
        <span
          className={cn(
            "font-medium",
            strength.level >= 3
              ? "text-[#3B7668]"
              : strength.level === 2
                ? "text-amber-600"
                : "text-muted-foreground"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 rounded-full",
              strength.level >= step
                ? strength.level >= 3
                  ? "bg-[#3B7668]"
                  : strength.level === 2
                    ? "bg-amber-500"
                    : "bg-muted-foreground/60"
                : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  )
}

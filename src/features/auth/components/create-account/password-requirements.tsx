import { Check, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

import { PASSWORD_REQUIREMENTS } from "../../schemas/auth.schemas"

type PasswordRequirementsProps = {
  id: string
  password: string
}

/**
 * Indicador em tempo real dos requisitos de senha.
 *
 * O estado é visual e também textual (`atendido`/`pendente` em texto para
 * leitores de tela), evitando depender apenas de cor.
 */
export function PasswordRequirements({
  id,
  password,
}: PasswordRequirementsProps) {
  return (
    <div id={id} className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Sua senha precisa ter:
      </p>

      <ul className="space-y-1.5">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = requirement.test(password)

          return (
            <li
              key={requirement.id}
              className={cn(
                "flex items-center gap-2 text-xs",
                met ? "text-success-strong" : "text-muted-foreground"
              )}
            >
              {met ? (
                <Check aria-hidden="true" className="size-3.5 shrink-0" />
              ) : (
                <Circle aria-hidden="true" className="size-3.5 shrink-0" />
              )}
              <span>{requirement.label}</span>
              <span className="sr-only">
                {met ? " (atendido)" : " (pendente)"}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

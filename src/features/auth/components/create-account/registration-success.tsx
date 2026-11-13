import Link from "next/link"
import { MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

type RegistrationSuccessProps = {
  message?: string
}

/**
 * Estado exibido quando o Supabase aceita o cadastro e exige confirmação de
 * e-mail. Substitui o formulário e as opções sociais por uma única ação clara.
 */
export function RegistrationSuccess({ message }: RegistrationSuccessProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-surface text-success-strong">
          <MailCheck aria-hidden="true" className="size-7" />
        </span>

        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Confira seu e-mail
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {message ??
            "Enviamos um link de confirmação. Abra a mensagem para ativar sua conta."}
        </p>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Não recebeu? Verifique a pasta de spam ou tente novamente em alguns
        minutos.
      </p>

      <Button asChild className="h-12 w-full rounded-lg text-base font-semibold">
        <Link href="/login">Ir para entrar</Link>
      </Button>
    </div>
  )
}

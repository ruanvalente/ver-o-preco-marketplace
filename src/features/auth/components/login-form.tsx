"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useFocusFirstError } from "../hooks/use-focus-first-error"
import { validateLoginForm } from "../schemas/auth.schemas"
import { loginAction } from "../services/auth.actions"
import {
  initialAuthState,
  type AuthActionState,
  type AuthField,
} from "../types/auth.types"
import { AuthInput } from "./auth-input"
import { AuthNotice } from "./auth-notice"
import { FormAlert } from "./form-alert"
import { PasswordInput } from "./password-input"

const FIELDS: readonly AuthField[] = ["email", "password"]

async function submitLogin(
  previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Validação imediata no cliente. O Server Action revalida antes de
  // qualquer chamada ao Supabase.
  const validation = validateLoginForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  return loginAction(previousState, formData)
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    submitLogin,
    initialAuthState
  )
  const [remember, setRemember] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("next") ?? ""
  const errors = state.fieldErrors ?? {}

  useFocusFirstError(state, FIELDS)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthNotice />

      {state.status === "error" && state.message ? (
        <FormAlert tone="error">{state.message}</FormAlert>
      ) : null}

      <input type="hidden" name="redirectTo" value={redirectTo} />

      <AuthInput
        id="email"
        name="email"
        type="email"
        label="E-mail"
        placeholder="seu.email@exemplo.com"
        autoComplete="email"
        inputMode="email"
        icon={Mail}
        required
        error={errors.email}
        className="h-12 rounded-lg bg-surface-container-low"
      />

      <PasswordInput
        id="password"
        name="password"
        label="Senha"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={errors.password}
        className="h-12 rounded-lg bg-surface-container-low"
        labelAction={
          <Link
            href="/forgot-password"
            className="rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Esqueceu a senha?
          </Link>
        }
      />

      <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-muted-foreground">
        <input
          type="checkbox"
          name="remember"
          value="true"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <span>Lembrar de mim neste dispositivo</span>
      </label>

      <Button
        type="submit"
        className="h-13 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-strong"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar na conta
            <ArrowRight aria-hidden="true" className="size-4" />
          </>
        )}
      </Button>
    </form>
  )
}

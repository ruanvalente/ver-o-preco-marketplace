"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import { useFocusFirstError } from "../hooks/use-focus-first-error"
import { validateForgotPasswordForm } from "../schemas/auth.schemas"
import { forgotPasswordAction } from "../services/auth.actions"
import {
  initialAuthState,
  type AuthActionState,
  type AuthField,
} from "../types/auth.types"
import { AuthInput } from "./auth-input"
import { AuthNotice } from "./auth-notice"
import { FormAlert } from "./form-alert"

const FIELDS: readonly AuthField[] = ["email"]

async function submitForgotPassword(
  previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateForgotPasswordForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  return forgotPasswordAction(previousState, formData)
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    submitForgotPassword,
    initialAuthState
  )
  const errors = state.fieldErrors ?? {}

  useFocusFirstError(state, FIELDS)

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <FormAlert tone="success">{state.message}</FormAlert>
        <p className="text-sm text-muted-foreground">
          O link expira em algumas horas. Se necessário, você pode solicitar
          outro.
        </p>
        <Button asChild variant="outline" className="h-11 w-full">
          <Link href="/forgot-password">Enviar para outro e-mail</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Voltar para entrar
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthNotice />

      {state.status === "error" && state.message ? (
        <FormAlert tone="error">{state.message}</FormAlert>
      ) : null}

      <AuthInput
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        inputMode="email"
        required
        error={errors.email}
      />

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Enviando..." : "Enviar link de recuperação"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}

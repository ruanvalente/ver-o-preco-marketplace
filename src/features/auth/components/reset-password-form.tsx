"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import { useFocusFirstError } from "../hooks/use-focus-first-error"
import {
  PASSWORD_MIN_LENGTH,
  validateResetPasswordForm,
} from "../schemas/auth.schemas"
import { resetPasswordAction } from "../services/auth.actions"
import {
  initialAuthState,
  type AuthActionState,
  type AuthField,
} from "../types/auth.types"
import { AuthInput } from "./auth-input"
import { FormAlert } from "./form-alert"

const FIELDS: readonly AuthField[] = ["password", "passwordConfirmation"]

async function submitResetPassword(
  previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateResetPasswordForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  return resetPasswordAction(previousState, formData)
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    submitResetPassword,
    initialAuthState
  )
  const errors = state.fieldErrors ?? {}

  useFocusFirstError(state, FIELDS)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <FormAlert tone="error">{state.message}</FormAlert>
      ) : null}

      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Nova senha"
        autoComplete="new-password"
        hint={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`}
        required
        error={errors.password}
      />

      <AuthInput
        id="passwordConfirmation"
        name="passwordConfirmation"
        type="password"
        label="Confirmar nova senha"
        autoComplete="new-password"
        required
        error={errors.passwordConfirmation}
      />

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  )
}

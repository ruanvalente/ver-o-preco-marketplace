"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import {
  ArrowRight,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { PARA_MUNICIPALITIES } from "../data/para-municipalities"
import { useFocusFirstError } from "../hooks/use-focus-first-error"
import { validateRegisterForm } from "../schemas/auth.schemas"
import { registerAction } from "../services/auth.actions"
import {
  initialAuthState,
  type AuthActionState,
  type AuthField,
} from "../types/auth.types"
import { AuthInput } from "./auth-input"
import { AuthSelect } from "./create-account/auth-select"
import { ConsentCheckbox } from "./create-account/consent-checkbox"
import { PasswordRequirements } from "./create-account/password-requirements"
import { RegistrationSuccess } from "./create-account/registration-success"
import { FormAlert } from "./form-alert"
import { PasswordInput } from "./password-input"

const FIELDS: readonly AuthField[] = [
  "name",
  "email",
  "municipality",
  "password",
  "passwordConfirmation",
  "termsAccepted",
]

type RegistrationValues = {
  name: string
  email: string
  municipality: string
  password: string
  passwordConfirmation: string
  termsAccepted: boolean
  marketingOptIn: boolean
}

const INITIAL_VALUES: RegistrationValues = {
  name: "",
  email: "",
  municipality: "",
  password: "",
  passwordConfirmation: "",
  termsAccepted: false,
  marketingOptIn: false,
}

const PASSWORD_REQUIREMENTS_ID = "password-requirements"

const LINK_CLASS =
  "rounded-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

async function submitRegistration(
  previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Validação imediata no cliente. O Server Action revalida antes de
  // qualquer chamada ao Supabase.
  const validation = validateRegisterForm(formData)

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors }
  }

  return registerAction(previousState, formData)
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    submitRegistration,
    initialAuthState
  )
  const [values, setValues] = useState<RegistrationValues>(INITIAL_VALUES)
  const errors = state.fieldErrors ?? {}

  useFocusFirstError(state, FIELDS)

  function updateField<K extends keyof RegistrationValues>(
    field: K,
    value: RegistrationValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  if (state.status === "success") {
    return <RegistrationSuccess message={state.message} />
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-5" noValidate>
        {state.status === "error" && state.message ? (
          <FormAlert tone="error">{state.message}</FormAlert>
        ) : null}

        <AuthInput
          id="name"
          name="name"
          type="text"
          label="Nome completo"
          placeholder="Seu nome completo"
          autoComplete="name"
          icon={UserRound}
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
          error={errors.name}
          className="h-12 rounded-lg bg-surface-container-low"
        />

        <AuthInput
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          inputMode="email"
          icon={Mail}
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
          error={errors.email}
          className="h-12 rounded-lg bg-surface-container-low"
        />

        <AuthSelect
          id="municipality"
          name="municipality"
          label="Município"
          placeholder="Selecione seu município"
          options={PARA_MUNICIPALITIES}
          icon={MapPin}
          autoComplete="address-level2"
          value={values.municipality}
          onChange={(event) => updateField("municipality", event.target.value)}
          required
          error={errors.municipality}
          className="bg-surface-container-low"
        />

        <div className="space-y-2">
          <PasswordInput
            id="password"
            name="password"
            label="Senha"
            placeholder="Crie uma senha segura"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            descriptionId={PASSWORD_REQUIREMENTS_ID}
            required
            error={errors.password}
            className="h-12 rounded-lg bg-surface-container-low"
          />

          <PasswordRequirements
            id={PASSWORD_REQUIREMENTS_ID}
            password={values.password}
          />
        </div>

        <PasswordInput
          id="passwordConfirmation"
          name="passwordConfirmation"
          label="Confirmar senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
          icon={ShieldCheck}
          value={values.passwordConfirmation}
          onChange={(event) =>
            updateField("passwordConfirmation", event.target.value)
          }
          required
          error={errors.passwordConfirmation}
          className="h-12 rounded-lg bg-surface-container-low"
        />

        <div className="space-y-4">
          <ConsentCheckbox
            id="termsAccepted"
            name="termsAccepted"
            checked={values.termsAccepted}
            onCheckedChange={(checked) =>
              updateField("termsAccepted", checked)
            }
            required
            error={errors.termsAccepted}
          >
            Li e aceito os{" "}
            <Link href="/terms" className={LINK_CLASS}>
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacy" className={LINK_CLASS}>
              Política de Privacidade
            </Link>
            .
          </ConsentCheckbox>

          <ConsentCheckbox
            id="marketingOptIn"
            name="marketingOptIn"
            checked={values.marketingOptIn}
            onCheckedChange={(checked) =>
              updateField("marketingOptIn", checked)
            }
          >
            Quero receber novidades, ofertas e dicas do Ver-o-Preço por e-mail.{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </ConsentCheckbox>
        </div>

        <Button
          type="submit"
          className="h-13 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-strong"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Criando sua conta...
            </>
          ) : (
            <>
              Criar minha conta
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className={LINK_CLASS}>
          Entrar
        </Link>
      </p>
    </div>
  )
}

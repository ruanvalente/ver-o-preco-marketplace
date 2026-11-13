"use client"

import { useEffect } from "react"

import type { AuthActionState, AuthField } from "../types/auth.types"

/**
 * Move o foco para o primeiro campo inválido depois de uma validação.
 * Erros continuam associados via `aria-describedby`; o foco garante que
 * usuários de teclado e leitores de tela percebam o problema.
 */
export function useFocusFirstError(
  state: AuthActionState,
  fields: readonly AuthField[]
) {
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) {
      return
    }

    const firstInvalidField = fields.find(
      (field) => state.fieldErrors?.[field]
    )

    if (!firstInvalidField) {
      return
    }

    const element = document.getElementById(firstInvalidField)

    if (element instanceof HTMLElement) {
      element.focus()
    }
  }, [state, fields])
}

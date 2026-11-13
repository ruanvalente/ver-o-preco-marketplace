"use client"

import { useSearchParams } from "next/navigation"

import { getAuthNotice } from "../utils/auth-notice"
import { FormAlert } from "./form-alert"

/**
 * Avisos vindos de redirecionamentos (por exemplo, link expirado).
 */
export function AuthNotice() {
  const searchParams = useSearchParams()
  const notice = getAuthNotice(searchParams.get("erro"))

  if (!notice) {
    return null
  }

  return <FormAlert tone="error">{notice}</FormAlert>
}

import type { ReactNode } from "react"

import { Alert } from "@/components/ui/alert"

type FormAlertTone = "error" | "success" | "info"

type FormAlertProps = {
  tone: FormAlertTone
  children: ReactNode
}

export function FormAlert({ tone, children }: FormAlertProps) {
  if (tone === "error") {
    return <Alert variant="destructive">{children}</Alert>
  }

  if (tone === "success") {
    return <Alert variant="success">{children}</Alert>
  }

  return <Alert>{children}</Alert>
}

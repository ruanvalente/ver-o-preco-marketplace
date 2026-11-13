"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { logoutAction } from "../services/auth.actions"

type LogoutButtonProps = {
  className?: string
}

function LogoutSubmit({ className }: LogoutButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className={cn("h-10", className)}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Saindo..." : "Sair"}
    </Button>
  )
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <LogoutSubmit className={className} />
    </form>
  )
}

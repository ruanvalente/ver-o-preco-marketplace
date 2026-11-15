"use client"

import type { ReactNode } from "react"
import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

type DashboardStatusButtonProps = {
  children: ReactNode
  pendingLabel: string
}

export function DashboardStatusButton({
  children,
  pendingLabel,
}: DashboardStatusButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="sm"
      variant="ghost"
      disabled={pending}
      aria-busy={pending}
      className="min-h-11"
    >
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

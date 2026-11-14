"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function RetryButton() {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      className="mt-3"
      onClick={() => router.refresh()}
    >
      Tentar novamente
    </Button>
  )
}

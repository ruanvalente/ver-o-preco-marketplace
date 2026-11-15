"use client"

import { useActionState } from "react"
import { LoaderCircle, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

import { startConversationAction } from "../services/chat.actions"
import type { ChatActionState } from "../types/chat.types"

const initialState: ChatActionState = { status: "idle" }

export function StartConversationButton({
  productId,
}: {
  productId: string
}) {
  const [state, action, pending] = useActionState(
    startConversationAction,
    initialState,
  )

  return (
    <div className="space-y-2">
      <form action={action}>
        <input type="hidden" name="productId" value={productId} />
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          aria-busy={pending}
          className="min-h-11 w-full gap-2"
        >
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <MessageCircle aria-hidden="true" className="size-4" />
          )}
          Conversar com o vendedor
        </Button>
      </form>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-center text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </div>
  )
}

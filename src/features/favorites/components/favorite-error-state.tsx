import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FavoriteErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
      >
        <AlertCircle className="size-7" />
      </span>
      <h2 className="mt-4 text-headline-sm font-semibold text-foreground">
        Seus favoritos não carregaram
      </h2>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/favorites">Tentar novamente</Link>
      </Button>
    </div>
  )
}

import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
}

/**
 * Estrutura visual compartilhada pelas telas de autenticação.
 * Mobile-first: conteúdo centralizado, largura máxima confortável e
 * hierarquia de título explícita.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="container mx-auto flex w-full flex-1 items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              {title}
            </h1>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  )
}

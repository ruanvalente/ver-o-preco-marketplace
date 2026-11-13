"use client"

import { useState, type ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type MobileProductFiltersProps = {
  children: ReactNode
  activeCount: number
}

/**
 * Drawer de filtros no mobile.
 *
 * O formulário em si é renderizado no servidor e passado como children. O
 * drawer fecha automaticamente quando a URL muda após aplicar os filtros: o
 * catálogo remonta este componente com uma `key` derivada dos filtros atuais.
 */
export function MobileProductFilters({
  children,
  activeCount,
}: MobileProductFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros
          {activeCount > 0 && (
            <Badge
              aria-label={`${activeCount} filtros ativos`}
              className="ml-1 h-5 min-w-5 justify-center px-1.5"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Refine os anúncios por categoria, condição, preço e localização.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

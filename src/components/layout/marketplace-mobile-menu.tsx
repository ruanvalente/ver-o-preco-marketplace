"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown, MapPin, Menu, Plus, X } from "lucide-react"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { MarketplacePolo } from "@/features/products/types/marketplace.types"

import { HeaderSearchForm } from "./header-search-form"

type MarketplaceMobileMenuProps = {
  polos: MarketplacePolo[]
  categories: { id: string; label: string; href: string }[]
  accountAction: ReactNode
}

/**
 * Navegação mobile do marketplace.
 *
 * Client Component por causa do Sheet (foco, teclado e fechamento). Os links
 * continuam sendo navegação real.
 */
export function MarketplaceMobileMenu({
  polos,
  categories,
  accountAction,
}: MarketplaceMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-11 rounded-full lg:hidden",
        )}
        aria-label="Abrir menu de navegação"
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[min(22rem,88vw)] gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="relative border-b border-border px-5 py-4 pr-14 text-left">
          <SheetTitle className="text-base font-bold text-primary">
            Ver-o-Preço
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegação, busca, categorias e acesso à sua conta.
          </SheetDescription>
          <SheetClose
            aria-label="Fechar menu"
            className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-5" />
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <HeaderSearchForm id="mobile-menu-search" />

          <form
            action="/products"
            method="get"
            role="search"
            aria-label="Filtrar anúncios por região"
            className="flex h-11 items-center gap-2 rounded-full border border-border bg-background px-3"
          >
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <label htmlFor="mobile-menu-location" className="sr-only">
              Região
            </label>
            <div className="relative flex min-w-0 flex-1 items-center">
              <select
                id="mobile-menu-location"
                name="location"
                defaultValue="belem"
                className="h-11 w-full appearance-none bg-transparent pr-5 text-sm font-medium text-foreground outline-none"
              >
                {polos.map((polo) => (
                  <option key={polo.value} value={polo.value}>
                    {polo.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-0 size-3.5 text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              aria-label="Aplicar região selecionada"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </form>

          <nav aria-label="Categorias do marketplace">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Categorias
            </h2>
            <ul className="mt-2 space-y-0.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <SheetClose asChild>
                    <Link
                      href={category.href}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {category.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-2 border-t border-border pt-5">
            <SheetClose asChild>
              <Link
                href="/listings/new"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-11 w-full rounded-full",
                )}
              >
                <Plus aria-hidden="true" className="size-4" />
                Anunciar produto
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/listings"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 w-full rounded-full",
                )}
              >
                Meus anúncios
              </Link>
            </SheetClose>

            {accountAction}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

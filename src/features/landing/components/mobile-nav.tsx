"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { landingNavItems } from "../data/landing-content"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 xl:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 bg-card p-0"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-border p-4">
          <div>
            <SheetTitle className="text-base">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navegação principal do Ver-o-Preço.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Fechar menu"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <nav
          aria-label="Navegação principal"
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
        >
          {landingNavItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-border p-4">
          <SheetClose asChild>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
            >
              Entrar
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "h-11")}
            >
              Anunciar produto
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}

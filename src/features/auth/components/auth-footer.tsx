import Link from "next/link"

import { AUTH_FOOTER_LINKS } from "../data/login-content"

/**
 * Rodapé compartilhado pelas telas de autenticação.
 */
export function AuthFooter() {
  return (
    <footer className="border-t border-border bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="text-xs text-muted-foreground">
          © 2026 Ver-o-Preço Marketplace Pará. Todos os direitos reservados.
        </p>

        <nav aria-label="Links institucionais">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
            {AUTH_FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

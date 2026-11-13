import type { CategoryTone } from "../types/marketplace.types"

/**
 * Mapeamento estático de tons para classes Tailwind.
 *
 * As classes precisam existir literalmente no código para que o compilador do
 * Tailwind as gere. Manter o mapa aqui evita duplicação entre as seções que
 * usam o mesmo conjunto de tons.
 */
export const categoryToneClasses: Record<CategoryTone, string> = {
  primary: "bg-primary-muted text-primary",
  secondary: "bg-secondary-muted text-secondary-strong",
  success: "bg-success-surface text-success-strong",
  warning: "bg-warning-surface text-warning-strong",
  featured: "bg-featured-surface text-featured",
}

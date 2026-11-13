const editablePriceFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const listingDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

/**
 * Formata um preço para edição no input, preservando os centavos.
 *
 * O catálogo usa `formatPrice` (sem centavos) para exibição, mas o formulário
 * precisa devolver o valor exato que será salvo.
 */
export function formatEditablePrice(value: number): string {
  return editablePriceFormatter.format(value)
}

export function formatListingDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível"
  }

  return listingDateFormatter.format(date)
}

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("pt-BR")

/**
 * Formata preços do marketplace sem centavos, no padrão usado pelos anúncios
 * (ex.: "R$ 4.500").
 */
export function formatPrice(value: number): string {
  return `R$ ${priceFormatter.format(value)}`
}

/**
 * Formata contagens com separador de milhar (ex.: "1.248").
 */
export function formatCount(value: number): string {
  return numberFormatter.format(value)
}

/**
 * Rótulo textual de tempo relativo usado nos cards de produto.
 *
 * O `referenceDate` é explícito para manter o resultado determinístico durante
 * a renderização estática. Com dados reais, a referência passa a ser o horário
 * da requisição.
 */
export function formatRelativeTime(
  publishedAt: string,
  referenceDate: string,
): string {
  const published = new Date(publishedAt).getTime()
  const reference = new Date(referenceDate).getTime()

  if (Number.isNaN(published) || Number.isNaN(reference)) {
    return "Publicado recentemente"
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((reference - published) / (1000 * 60)),
  )

  if (elapsedMinutes < 1) {
    return "Agora"
  }

  if (elapsedMinutes < 60) {
    return `Há ${elapsedMinutes} min`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return elapsedHours === 1 ? "Há 1 hora" : `Há ${elapsedHours} horas`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)

  if (elapsedDays < 7) {
    return elapsedDays === 1 ? "Há 1 dia" : `Há ${elapsedDays} dias`
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(publishedAt))
}

/**
 * Pluraliza contagens de anúncios.
 */
export function formatListingCount(value: number): string {
  return `${formatCount(value)} ${value === 1 ? "anúncio" : "anúncios"}`
}

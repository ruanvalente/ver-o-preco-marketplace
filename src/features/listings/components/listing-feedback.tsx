import { Alert } from "@/components/ui/alert"

type ListingFeedbackProps = {
  created?: string
  updated?: string
  deleted?: string
  error?: string
}

const SUCCESS_MESSAGES: Record<string, string> = {
  "created:draft": "Rascunho salvo. Você pode publicá-lo quando quiser.",
  "created:published": "Anúncio publicado! Ele já aparece no marketplace.",
  "updated:saved": "Alterações salvas.",
  "updated:published": "Anúncio publicado. Ele já aparece no marketplace.",
  "updated:paused":
    "Anúncio pausado. Ele não aparece mais no marketplace até ser publicado novamente.",
}

const ERROR_MESSAGES: Record<string, string> = {
  publish:
    "Não foi possível publicar o anúncio. Verifique se ele tem pelo menos uma imagem.",
  pause: "Não foi possível pausar o anúncio.",
  delete: "Não foi possível excluir o anúncio.",
  invalid: "Não foi possível concluir a ação.",
}

/**
 * Feedback pós-ação da área de anúncios.
 *
 * Usa parâmetros curtos na URL em vez de mensagens arbitrárias, mantendo o
 * redirecionamento seguro e previsível.
 */
export function ListingFeedback({
  created,
  updated,
  deleted,
  error,
}: ListingFeedbackProps) {
  if (deleted === "1") {
    return <Alert variant="success">Anúncio excluído.</Alert>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        {ERROR_MESSAGES[error] ?? "Não foi possível concluir a ação."}
      </Alert>
    )
  }

  const successKey = created
    ? `created:${created}`
    : updated
      ? `updated:${updated}`
      : null

  if (successKey && SUCCESS_MESSAGES[successKey]) {
    return <Alert variant="success">{SUCCESS_MESSAGES[successKey]}</Alert>
  }

  return null
}

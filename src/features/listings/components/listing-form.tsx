"use client"

import Link from "next/link"
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormAlert } from "@/features/auth/components/form-alert"
import { PARA_MUNICIPALITIES } from "@/features/auth/data/para-municipalities"
import type { ProductCondition } from "@/features/products/types/product.types"
import { PRODUCT_CONDITION_OPTIONS } from "@/features/products/utils/catalog-options"
import { cn } from "@/lib/utils"

import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_NEIGHBORHOOD_MAX_LENGTH,
  LISTING_TITLE_MAX_LENGTH,
  LISTING_TITLE_MIN_LENGTH,
} from "../constants"
import { useListingImages } from "../hooks/use-listing-images"
import { parseListingPrice, validateListingForm } from "../schemas/listing.schemas"
import {
  createListingAction,
  updateListingAction,
} from "../services/listing.actions"
import {
  initialListingActionState,
  type Listing,
  type ListingActionState,
  type ListingFormIntent,
} from "../types/listing.types"
import { formatEditablePrice } from "../utils/format"
import { ImageUploader } from "./image-uploader"
import { ListingPreview } from "./listing-preview"
import { ListingStatusBadge } from "./listing-status-badge"

export type ListingCategoryOption = {
  id: string
  name: string
}

type ListingFormProps = {
  mode: "create" | "edit"
  userId: string
  categories: ListingCategoryOption[]
  listing?: Listing
}

type ListingFormValues = {
  title: string
  description: string
  categoryId: string
  condition: ProductCondition | ""
  price: string
  city: string
  neighborhood: string
}

const FIELD_ORDER = [
  "title",
  "description",
  "categoryId",
  "condition",
  "price",
  "city",
  "neighborhood",
  "images",
] as const

const INPUT_CLASS = "h-11 rounded-lg bg-surface-container-low"
const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-input bg-surface-container-low px-3 pr-10 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"

function createInitialValues(listing?: Listing): ListingFormValues {
  if (!listing) {
    return {
      title: "",
      description: "",
      categoryId: "",
      condition: "",
      price: "",
      city: "",
      neighborhood: "",
    }
  }

  return {
    title: listing.title,
    description: listing.description,
    categoryId: listing.category.id,
    condition: listing.condition,
    price: formatEditablePrice(listing.price),
    city: listing.location.city,
    neighborhood: listing.location.neighborhood ?? "",
  }
}

function getImageSignature(images: { storagePath: string | null; isPrimary: boolean }[]): string {
  return JSON.stringify(
    images
      .filter((image) => Boolean(image.storagePath))
      .map((image) => [image.storagePath, image.isPrimary]),
  )
}

type FieldShellProps = {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Formulário de criação e edição de anúncio.
 *
 * O cliente valida antes de chamar o Server Action para dar feedback imediato,
 * mas a mesma validação roda novamente no servidor. `seller_id` e `status`
 * nunca são enviados pelo formulário: o servidor os deriva da sessão e da
 * intenção explícita (`draft`, `save` ou `publish`).
 */
export function ListingForm({
  mode,
  userId,
  categories,
  listing,
}: ListingFormProps) {
  const defaultIntent: ListingFormIntent = mode === "edit" ? "save" : "draft"
  const initialValues = useMemo(() => createInitialValues(listing), [listing])
  const initialImageSignature = useMemo(
    () =>
      getImageSignature(
        (listing?.images ?? [])
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder),
      ),
    [listing],
  )

  const [values, setValues] = useState<ListingFormValues>(initialValues)
  const [submittingIntent, setSubmittingIntent] =
    useState<ListingFormIntent | null>(null)
  const intentInputRef = useRef<HTMLInputElement>(null)

  const {
    images,
    removedImagePaths,
    fileError,
    uploadProgress,
    isUploading,
    hasBlockingUploads,
    canAddMore,
    addFiles,
    retryImage,
    removeImage,
    moveImage,
    setPrimaryImage,
    clearFileError,
  } = useListingImages({ userId, initialImages: listing?.images ?? [] })

  const imagePayload = images
    .filter((image) => image.status === "ready" && image.storagePath)
    .map((image, index) => ({
      storagePath: image.storagePath as string,
      altText: image.altText.trim() || null,
      sortOrder: index,
      isPrimary: image.isPrimary,
    }))
  const imageSignature = getImageSignature(
    images.filter((image) => image.status === "ready"),
  )
  const serializedImages = JSON.stringify(imagePayload)
  const serializedRemovedPaths = JSON.stringify(removedImagePaths)

  const valuesDirty =
    values.title !== initialValues.title ||
    values.description !== initialValues.description ||
    values.categoryId !== initialValues.categoryId ||
    values.condition !== initialValues.condition ||
    values.price !== initialValues.price ||
    values.city !== initialValues.city ||
    values.neighborhood !== initialValues.neighborhood

  const isDirty = valuesDirty || imageSignature !== initialImageSignature

  useEffect(() => {
    if (!isDirty) {
      return
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const [state, formAction, pending] = useActionState(
    async (
      previousState: ListingActionState,
      formData: FormData,
    ): Promise<ListingActionState> => {
      const validation = validateListingForm(formData)

      if (!validation.ok) {
        const { form, ...fieldErrors } = validation.errors

        return {
          status: "error",
          message: form,
          fieldErrors,
        }
      }

      return mode === "edit"
        ? updateListingAction(previousState, formData)
        : createListingAction(previousState, formData)
    },
    initialListingActionState,
  )

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) {
      return
    }

    const firstInvalidField = FIELD_ORDER.find(
      (field) => state.fieldErrors?.[field],
    )

    if (!firstInvalidField) {
      return
    }

    const element = document.getElementById(firstInvalidField)

    if (element instanceof HTMLElement) {
      element.focus()
    }
  }, [state])

  useEffect(() => {
    if (state.status !== "error") {
      return
    }

    // Depois de um erro, a próxima submissão implícita (Enter) volta à ação
    // padrão em vez de repetir a intenção do clique anterior.
    if (intentInputRef.current) {
      intentInputRef.current.value = defaultIntent
    }
  }, [state, defaultIntent])

  const errors = state.fieldErrors ?? {}
  const parsedPrice = parseListingPrice(values.price)
  const selectedCategoryName =
    categories.find((category) => category.id === values.categoryId)?.name ?? null

  function updateField<K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function selectIntent(intent: ListingFormIntent) {
    if (intentInputRef.current) {
      intentInputRef.current.value = intent
    }

    setSubmittingIntent(intent)
  }

  const submitDisabled = pending || hasBlockingUploads
  const canPublish = mode === "create" || listing?.status !== "active"

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Meus anúncios
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-headline-lg-mobile font-bold tracking-tight text-foreground sm:text-headline-lg">
            {mode === "edit" ? "Editar anúncio" : "Novo anúncio"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "edit"
              ? "Atualize os dados e as imagens do seu anúncio."
              : "Preencha os dados, adicione imagens e publique quando estiver pronto."}
          </p>
        </div>

        {listing ? <ListingStatusBadge status={listing.status} /> : null}
      </header>

      <form
        action={formAction}
        className="mt-6 space-y-6"
        noValidate
        aria-busy={pending}
      >
        <input
          ref={intentInputRef}
          type="hidden"
          name="intent"
          defaultValue={defaultIntent}
        />
        <input type="hidden" name="images" value={serializedImages} />
        <input
          type="hidden"
          name="removedImagePaths"
          value={serializedRemovedPaths}
        />
        {listing ? (
          <input type="hidden" name="listingId" value={listing.id} />
        ) : null}

        {state.status === "error" && state.message ? (
          <FormAlert tone="error">
            <div className="space-y-2">
              <p>{state.message}</p>
              {state.listingId ? (
                <Link
                  href={`/listings/${state.listingId}/edit`}
                  className="inline-block font-semibold underline underline-offset-4"
                >
                  Abrir anúncio salvo
                </Link>
              ) : null}
            </div>
          </FormAlert>
        ) : null}

        {hasBlockingUploads ? (
          <FormAlert tone="info">
            {isUploading
              ? "Aguarde o envio das imagens terminar para salvar o anúncio."
              : "Uma ou mais imagens falharam no envio. Tente novamente ou remova essas imagens antes de salvar."}
          </FormAlert>
        ) : null}

        <section
          aria-labelledby="listing-basic-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <h2
            id="listing-basic-heading"
            className="text-headline-sm font-semibold text-foreground"
          >
            Informações básicas
          </h2>

          <div className="mt-4 space-y-5">
            <FieldShell
              id="title"
              label="Título"
              required
              error={errors.title}
              hint={`Entre ${LISTING_TITLE_MIN_LENGTH} e ${LISTING_TITLE_MAX_LENGTH} caracteres.`}
            >
              <Input
                id="title"
                name="title"
                type="text"
                value={values.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Ex.: iPhone 15 Pro 256GB em ótimo estado"
                autoComplete="off"
                maxLength={LISTING_TITLE_MAX_LENGTH}
                required
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={
                  [errors.title ? "title-error" : null, "title-hint"]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                className={INPUT_CLASS}
              />
            </FieldShell>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Conte os detalhes, o estado de conservação, o que acompanha o produto…"
                maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                className="min-h-32 rounded-lg bg-surface-container-low"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  A descrição é opcional, mas ajuda os compradores.
                </p>
                <p
                  aria-live="polite"
                  className="text-xs tabular-nums text-muted-foreground"
                >
                  {values.description.length}/{LISTING_DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
              {errors.description ? (
                <p id="description-error" className="text-sm text-destructive">
                  {errors.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell
                id="categoryId"
                label="Categoria"
                required
                error={errors.categoryId}
              >
                <div className="relative">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={values.categoryId}
                    onChange={(event) =>
                      updateField("categoryId", event.target.value)
                    }
                    required
                    aria-invalid={errors.categoryId ? true : undefined}
                    aria-describedby={
                      errors.categoryId ? "categoryId-error" : undefined
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                  >
                    ▾
                  </span>
                </div>
              </FieldShell>

              <FieldShell
                id="condition"
                label="Condição"
                required
                error={errors.condition}
              >
                <div className="relative">
                  <select
                    id="condition"
                    name="condition"
                    value={values.condition}
                    onChange={(event) =>
                      updateField(
                        "condition",
                        event.target.value as ProductCondition | "",
                      )
                    }
                    required
                    aria-invalid={errors.condition ? true : undefined}
                    aria-describedby={
                      errors.condition ? "condition-error" : undefined
                    }
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Selecione a condição
                    </option>
                    {PRODUCT_CONDITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                  >
                    ▾
                  </span>
                </div>
              </FieldShell>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="listing-price-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <h2
            id="listing-price-heading"
            className="text-headline-sm font-semibold text-foreground"
          >
            Preço
          </h2>

          <div className="mt-4">
            <FieldShell
              id="price"
              label="Preço do anúncio"
              required
              error={errors.price}
              hint="Use vírgula para centavos, por exemplo 1.500,00."
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground"
                >
                  R$
                </span>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={values.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  onBlur={() => {
                    const parsed = parseListingPrice(values.price)

                    if (parsed !== null) {
                      updateField("price", formatEditablePrice(parsed))
                    }
                  }}
                  placeholder="0,00"
                  autoComplete="off"
                  required
                  aria-invalid={errors.price ? true : undefined}
                  aria-describedby={
                    [errors.price ? "price-error" : null, "price-hint"]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  className={cn(INPUT_CLASS, "pl-10")}
                />
              </div>
            </FieldShell>
          </div>
        </section>

        <section
          aria-labelledby="listing-location-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <h2
            id="listing-location-heading"
            className="text-headline-sm font-semibold text-foreground"
          >
            Localização
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FieldShell
              id="city"
              label="Município"
              required
              error={errors.city}
            >
              <div className="relative">
                <select
                  id="city"
                  name="city"
                  value={values.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  className={SELECT_CLASS}
                >
                  <option value="" disabled>
                    Selecione o município
                  </option>
                  {PARA_MUNICIPALITIES.map((municipality) => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                >
                  ▾
                </span>
              </div>
            </FieldShell>

            <FieldShell
              id="neighborhood"
              label="Bairro"
              error={errors.neighborhood}
              hint="Opcional."
            >
              <Input
                id="neighborhood"
                name="neighborhood"
                type="text"
                value={values.neighborhood}
                onChange={(event) =>
                  updateField("neighborhood", event.target.value)
                }
                placeholder="Ex.: Nazaré"
                autoComplete="address-level3"
                maxLength={LISTING_NEIGHBORHOOD_MAX_LENGTH}
                aria-invalid={errors.neighborhood ? true : undefined}
                aria-describedby={
                  [errors.neighborhood ? "neighborhood-error" : null, "neighborhood-hint"]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                className={INPUT_CLASS}
              />
            </FieldShell>
          </div>
        </section>

        <section
          aria-labelledby="listing-images-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <h2
            id="listing-images-heading"
            className="text-headline-sm font-semibold text-foreground"
          >
            Imagens
          </h2>

          <div className="mt-4 space-y-3">
            <ImageUploader
              images={images}
              fileError={fileError}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              canAddMore={canAddMore}
              onFilesSelected={addFiles}
              onRetry={retryImage}
              onRemove={removeImage}
              onMove={moveImage}
              onSetPrimary={setPrimaryImage}
              onClearError={clearFileError}
            />

            {errors.images ? (
              <p id="images-error" className="text-sm text-destructive">
                {errors.images}
              </p>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="listing-actions-heading"
          className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2
                id="listing-actions-heading"
                className="text-headline-sm font-semibold text-foreground"
              >
                Publicação
              </h2>
              <p
                aria-live="polite"
                className={cn(
                  "text-sm",
                  isDirty ? "text-warning-strong" : "text-muted-foreground",
                )}
              >
                {isDirty
                  ? "Você tem alterações não salvas."
                  : "Tudo salvo até aqui."}
              </p>
            </div>

            <ListingPreview
              title={values.title}
              description={values.description}
              categoryName={selectedCategoryName}
              condition={values.condition}
              price={parsedPrice}
              city={values.city}
              neighborhood={values.neighborhood}
              images={images}
            />
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild variant="ghost">
              <Link href="/listings">Cancelar</Link>
            </Button>

            <Button
              type="submit"
              variant={mode === "create" ? "outline" : "default"}
              disabled={submitDisabled}
              aria-busy={pending && submittingIntent === defaultIntent}
              onClick={() => selectIntent(defaultIntent)}
            >
              {pending && submittingIntent === defaultIntent ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {mode === "edit" ? "Salvar alterações" : "Salvar rascunho"}
            </Button>

            {canPublish ? (
              <Button
                type="submit"
                variant={mode === "create" ? "default" : "outline"}
                disabled={submitDisabled}
                aria-busy={pending && submittingIntent === "publish"}
                onClick={() => selectIntent("publish")}
              >
                {pending && submittingIntent === "publish" ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Send aria-hidden="true" className="size-4" />
                )}
                {pending && submittingIntent === "publish"
                  ? "Publicando…"
                  : "Publicar anúncio"}
              </Button>
            ) : null}
          </div>

          {hasBlockingUploads ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              Conclua ou remova as imagens pendentes para liberar a publicação.
            </p>
          ) : null}
        </section>
      </form>
    </div>
  )
}

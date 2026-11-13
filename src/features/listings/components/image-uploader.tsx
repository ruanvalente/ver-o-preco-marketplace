"use client"

import Image from "next/image"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { LISTING_IMAGE_ACCEPT, LISTING_IMAGE_HELP_TEXT } from "../constants"
import type {
  ManagedListingImage,
  UploadProgress,
} from "../hooks/use-listing-images"

type ImageUploaderProps = {
  id?: string
  images: ManagedListingImage[]
  fileError: string | null
  uploadProgress: UploadProgress | null
  isUploading: boolean
  canAddMore: boolean
  onFilesSelected: (files: File[]) => void
  onRetry: (id: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
  onSetPrimary: (id: string) => void
  onClearError: () => void
}

function imageLabel(image: ManagedListingImage, index: number): string {
  return image.altText.trim() || `Imagem ${index + 1}`
}

/**
 * Uploader de imagens do anúncio.
 *
 * Mantém apenas apresentação e eventos: upload, retry e remoção vivem no hook
 * `useListingImages`. Os controles de ordenação são botões (não drag-and-drop)
 * para funcionar com teclado e leitores de tela.
 */
export function ImageUploader({
  id = "images",
  images,
  fileError,
  uploadProgress,
  isUploading,
  canAddMore,
  onFilesSelected,
  onRetry,
  onRemove,
  onMove,
  onSetPrimary,
  onClearError,
}: ImageUploaderProps) {
  const progressPercent = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor={id}>Imagens do anúncio</Label>
        <p className="text-sm text-muted-foreground">
          {LISTING_IMAGE_HELP_TEXT} A primeira imagem (ou a marcada como
          principal) aparece no catálogo.
        </p>
      </div>

      {canAddMore ? (
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-container-low px-6 py-8 text-center transition-colors",
            "hover:border-primary/50 hover:bg-primary-muted/40",
            "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-primary-muted text-primary"
          >
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {isUploading ? "Enviando imagens…" : "Adicionar imagens"}
          </span>
          <span className="text-label-sm text-muted-foreground">
            Selecione até 8 arquivos JPG, PNG ou WebP
          </span>
          <input
            id={id}
            type="file"
            accept={LISTING_IMAGE_ACCEPT}
            multiple
            disabled={isUploading}
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? [])
              onFilesSelected(files)
              event.target.value = ""
            }}
          />
        </label>
      ) : (
        <p className="rounded-xl border border-border bg-surface-container-low px-4 py-3 text-sm text-muted-foreground">
          Limite de 8 imagens atingido. Remova uma imagem para adicionar outra.
        </p>
      )}

      {uploadProgress ? (
        <div role="status" aria-live="polite" className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enviando {uploadProgress.completed} de {uploadProgress.total}{" "}
            {uploadProgress.total === 1 ? "imagem" : "imagens"}…
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={uploadProgress.total}
            aria-valuenow={uploadProgress.completed}
            aria-label="Progresso do envio de imagens"
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {fileError ? (
        <Alert variant="destructive" className="flex items-start gap-2">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p>{fileError}</p>
            <button
              type="button"
              onClick={onClearError}
              className="mt-1 rounded-sm text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Fechar aviso
            </button>
          </div>
        </Alert>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((image, index) => {
            const label = imageLabel(image, index)
            const isBusy = image.status === "uploading"

            return (
              <li
                key={image.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={label}
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-label-sm text-muted-foreground">
                      Sem prévia
                    </div>
                  )}

                  {image.isPrimary ? (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-label-sm font-semibold text-primary-foreground shadow-card">
                      <Star aria-hidden="true" className="size-3" />
                      Principal
                    </span>
                  ) : null}

                  {isBusy ? (
                    <div
                      role="status"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 text-sm font-medium text-foreground"
                    >
                      <Loader2
                        aria-hidden="true"
                        className="size-5 animate-spin"
                      />
                      Enviando…
                    </div>
                  ) : null}

                  {image.status === "error" ? (
                    <div
                      role="alert"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/90 px-3 text-center text-sm font-medium text-white"
                    >
                      <AlertCircle aria-hidden="true" className="size-5" />
                      {image.error ?? "Falha no envio"}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1 p-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Mover ${label} para cima`}
                    disabled={index === 0}
                    onClick={() => onMove(image.id, -1)}
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Mover ${label} para baixo`}
                    disabled={index === images.length - 1}
                    onClick={() => onMove(image.id, 1)}
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </Button>

                  {!image.isPrimary && image.status === "ready" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Definir ${label} como imagem principal`}
                      onClick={() => onSetPrimary(image.id)}
                    >
                      <Star aria-hidden="true" className="size-4" />
                      Principal
                    </Button>
                  ) : null}

                  {image.status === "error" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Tentar enviar ${label} novamente`}
                      onClick={() => onRetry(image.id)}
                    >
                      <RotateCcw aria-hidden="true" className="size-4" />
                      Tentar novamente
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remover ${label}`}
                    className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemove(image.id)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

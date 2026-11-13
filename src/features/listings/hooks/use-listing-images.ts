"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { LISTING_IMAGE_MAX_COUNT } from "../constants"
import { validateListingImageFile } from "../schemas/listing.schemas"
import {
  deleteListingImage,
  uploadListingImage,
} from "../services/listing-storage.service"
import type {
  ListingImage,
  ListingImageInput,
} from "../types/listing.types"

export type ManagedListingImage = {
  id: string
  storagePath: string | null
  url: string
  altText: string
  isPrimary: boolean
  status: "ready" | "uploading" | "error"
  error?: string
  file?: File
  persisted: boolean
}

export type UploadProgress = {
  total: number
  completed: number
}

type UseListingImagesOptions = {
  userId: string
  initialImages?: ListingImage[]
}

type UseListingImagesResult = {
  images: ManagedListingImage[]
  removedImagePaths: string[]
  fileError: string | null
  uploadProgress: UploadProgress | null
  isUploading: boolean
  hasBlockingUploads: boolean
  canAddMore: boolean
  addFiles: (files: File[]) => Promise<void>
  retryImage: (id: string) => Promise<void>
  removeImage: (id: string) => void
  moveImage: (id: string, direction: -1 | 1) => void
  setPrimaryImage: (id: string) => void
  clearFileError: () => void
  getImagesPayload: () => ListingImageInput[]
}

function createRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

function createObjectUrl(file: File): string {
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    return URL.createObjectURL(file)
  }

  return ""
}

function mapInitialImages(initialImages: ListingImage[]): ManagedListingImage[] {
  return initialImages
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      storagePath: image.storagePath,
      url: image.url,
      altText: image.alt,
      isPrimary: image.isPrimary,
      status: "ready",
      persisted: true,
    }))
}

function ensurePrimary(images: ManagedListingImage[]): ManagedListingImage[] {
  if (images.length === 0) {
    return images
  }

  if (images.some((image) => image.isPrimary)) {
    return images
  }

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }))
}

/**
 * Estado das imagens do formulário de anúncio.
 *
 * O hook concentra upload, retry, remoção, ordenação e imagem principal para
 * que o formulário e o uploader permaneçam apenas visuais. Imagens novas são
 * enviadas imediatamente ao Storage; imagens persistidas só são removidas do
 * Storage pelo servidor depois que a substituição no banco é confirmada.
 */
export function useListingImages({
  userId,
  initialImages = [],
}: UseListingImagesOptions): UseListingImagesResult {
  const [images, setImages] = useState<ManagedListingImage[]>(() =>
    ensurePrimary(mapInitialImages(initialImages)),
  )
  const [removedImagePaths, setRemovedImagePaths] = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  )

  const objectUrlsRef = useRef(new Map<string, string>())
  const imagesRef = useRef(images)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
      objectUrls.clear()
    }
  }, [])

  const isUploading = images.some((image) => image.status === "uploading")
  const hasBlockingUploads = images.some((image) => image.status !== "ready")
  const canAddMore = images.length < LISTING_IMAGE_MAX_COUNT && !isUploading

  const uploadEntry = useCallback(
    async (entry: ManagedListingImage) => {
      if (!entry.file) {
        return
      }

      const result = await uploadListingImage(entry.file, userId)

      setImages((current) =>
        current.map((image) => {
          if (image.id !== entry.id) {
            return image
          }

          if (!result.ok) {
            return { ...image, status: "error", error: result.error }
          }

          const objectUrl = objectUrlsRef.current.get(image.id)

          if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
            objectUrlsRef.current.delete(image.id)
          }

          return {
            ...image,
            storagePath: result.data.storagePath,
            url: result.data.url,
            status: "ready",
            error: undefined,
          }
        }),
      )
    },
    [userId],
  )

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return
      }

      const currentImages = imagesRef.current
      const available = LISTING_IMAGE_MAX_COUNT - currentImages.length

      if (available <= 0) {
        setFileError(
          `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`,
        )
        return
      }

      const selected = files.slice(0, available)
      const overflow = files.length - selected.length
      const validFiles: File[] = []
      let firstError: string | null = null

      for (const file of selected) {
        const validation = validateListingImageFile(file)

        if (!validation.ok) {
          firstError = firstError ?? validation.error ?? "Imagem inválida."
          continue
        }

        validFiles.push(file)
      }

      if (overflow > 0) {
        setFileError(
          `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`,
        )
      } else if (firstError) {
        setFileError(firstError)
      } else {
        setFileError(null)
      }

      if (validFiles.length === 0) {
        return
      }

      const hasPrimary = currentImages.some((image) => image.isPrimary)

      const entries: ManagedListingImage[] = validFiles.map((file, index) => {
        const id = `pending-${createRandomId()}`
        const objectUrl = createObjectUrl(file)

        if (objectUrl) {
          objectUrlsRef.current.set(id, objectUrl)
        }

        return {
          id,
          storagePath: null,
          url: objectUrl,
          altText: "",
          isPrimary: !hasPrimary && index === 0,
          status: "uploading",
          file,
          persisted: false,
        }
      })

      setImages((current) => ensurePrimary([...current, ...entries]))
      setUploadProgress({ total: entries.length, completed: 0 })

      for (const entry of entries) {
        await uploadEntry(entry)
        setUploadProgress((current) =>
          current
            ? { ...current, completed: current.completed + 1 }
            : current,
        )
      }

      setUploadProgress(null)
    },
    [uploadEntry],
  )

  const retryImage = useCallback(
    async (id: string) => {
      const entry = imagesRef.current.find((image) => image.id === id)

      if (!entry || entry.status !== "error" || !entry.file) {
        return
      }

      setImages((current) =>
        current.map((image) =>
          image.id === id
            ? { ...image, status: "uploading", error: undefined }
            : image,
        ),
      )
      setUploadProgress({ total: 1, completed: 0 })

      await uploadEntry(entry)

      setUploadProgress({ total: 1, completed: 1 })
      setUploadProgress(null)
    },
    [uploadEntry],
  )

  const removeImage = useCallback((id: string) => {
    const entry = imagesRef.current.find((image) => image.id === id)

    if (!entry) {
      return
    }

    const objectUrl = objectUrlsRef.current.get(id)

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrlsRef.current.delete(id)
    }

    if (entry.persisted && entry.storagePath) {
      setRemovedImagePaths((current) =>
        current.includes(entry.storagePath as string)
          ? current
          : [...current, entry.storagePath as string],
      )
    } else if (entry.storagePath) {
      // Arquivo já enviado, mas ainda não persistido no banco: pode ser
      // removido imediatamente sem afetar nenhum anúncio.
      void deleteListingImage(entry.storagePath)
    }

    setImages((current) =>
      ensurePrimary(current.filter((image) => image.id !== id)),
    )
  }, [])

  const moveImage = useCallback((id: string, direction: -1 | 1) => {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id)
      const target = index + direction

      if (index === -1 || target < 0 || target >= current.length) {
        return current
      }

      const next = current.slice()
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)

      return next
    })
  }, [])

  const setPrimaryImage = useCallback((id: string) => {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    )
  }, [])

  const clearFileError = useCallback(() => {
    setFileError(null)
  }, [])

  const getImagesPayload = useCallback((): ListingImageInput[] => {
    const ready = imagesRef.current.filter(
      (image) => image.status === "ready" && image.storagePath,
    )

    return ready.map((image, index) => ({
      storagePath: image.storagePath as string,
      altText: image.altText.trim() || null,
      sortOrder: index,
      isPrimary: image.isPrimary,
    }))
  }, [])

  return {
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
    getImagesPayload,
  }
}

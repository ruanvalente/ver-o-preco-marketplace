import { describe, expect, it } from "vitest"

import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MAX_COUNT,
  LISTING_TITLE_MAX_LENGTH,
} from "../constants"
import {
  isListingImageExtensionAllowed,
  parseListingPrice,
  validateListingForm,
  validateListingImageFile,
} from "../schemas/listing.schemas"
import { categoryId, listingId, sellerId } from "./fixtures"

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value)
  })

  return formData
}

function buildImage(
  overrides: Partial<{
    storagePath: string
    altText: string
    sortOrder: number
    isPrimary: boolean
  }> = {},
) {
  return {
    storagePath: `${sellerId}/photo-1.png`,
    altText: "",
    sortOrder: 0,
    isPrimary: true,
    ...overrides,
  }
}

function validForm(overrides: Record<string, string> = {}) {
  return buildFormData({
    intent: "draft",
    title: "iPhone 15 Pro",
    description: "Excelente estado.",
    categoryId,
    condition: "like_new",
    price: "1.500,50",
    city: "Belém",
    neighborhood: "Nazaré",
    images: JSON.stringify([buildImage()]),
    removedImagePaths: "[]",
    ...overrides,
  })
}

function fileWith(
  type: string,
  size: number,
  name = "photo.png",
): File {
  const file = new File(["conteúdo"], name, { type })
  Object.defineProperty(file, "size", { value: size })

  return file
}

describe("parseListingPrice", () => {
  it("interpreta notação brasileira e decimal", () => {
    expect(parseListingPrice("1.500,50")).toBe(1500.5)
    expect(parseListingPrice("1500,50")).toBe(1500.5)
    expect(parseListingPrice("1500.50")).toBe(1500.5)
  })

  it("interpreta milhar sem centavos", () => {
    expect(parseListingPrice("1.500")).toBe(1500)
    expect(parseListingPrice("R$ 2.000")).toBe(2000)
  })

  it("rejeita valores vazios, negativos ou não numéricos", () => {
    expect(parseListingPrice("")).toBeNull()
    expect(parseListingPrice("   ")).toBeNull()
    expect(parseListingPrice("-10")).toBeNull()
    expect(parseListingPrice("abc")).toBeNull()
  })
})

describe("validateListingForm", () => {
  it("aceita um anúncio válido e normaliza o preço", () => {
    const result = validateListingForm(validForm())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.intent).toBe("draft")
      expect(result.data.input.price).toBe(1500.5)
      expect(result.data.input.city).toBe("Belém")
      expect(result.data.input.neighborhood).toBe("Nazaré")
      expect(result.data.images).toEqual([
        {
          storagePath: `${sellerId}/photo-1.png`,
          altText: null,
          sortOrder: 0,
          isPrimary: true,
        },
      ])
    }
  })

  it("exige os campos obrigatórios", () => {
    const result = validateListingForm(
      buildFormData({
        intent: "draft",
        images: "[]",
        removedImagePaths: "[]",
      }),
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.title).toBe("Informe o título do anúncio.")
      expect(result.errors.categoryId).toBe("Selecione uma categoria.")
      expect(result.errors.condition).toBe("Selecione a condição do produto.")
      expect(result.errors.price).toBe("Informe o preço do anúncio.")
      expect(result.errors.city).toBe("Selecione o município do anúncio.")
    }
  })

  it("rejeita municípios fora do Pará", () => {
    const result = validateListingForm(validForm({ city: "São Paulo" }))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.city).toBe("Selecione um município do Pará.")
    }
  })

  it("rejeita título e descrição acima do limite", () => {
    const result = validateListingForm(
      validForm({
        title: "a".repeat(LISTING_TITLE_MAX_LENGTH + 1),
        description: "a".repeat(LISTING_DESCRIPTION_MAX_LENGTH + 1),
      }),
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.title).toContain("no máximo")
      expect(result.errors.description).toContain("no máximo")
    }
  })

  it("rejeita intenções incompatíveis com o modo do formulário", () => {
    const existingDraft = validateListingForm(
      validForm({ listingId, intent: "draft" }),
    )

    expect(existingDraft.ok).toBe(false)
    if (!existingDraft.ok) {
      expect(existingDraft.errors.form).toBe(
        "Ação inválida para um anúncio existente.",
      )
    }

    const newSave = validateListingForm(validForm({ intent: "save" }))

    expect(newSave.ok).toBe(false)
    if (!newSave.ok) {
      expect(newSave.errors.form).toBe(
        "Ação inválida para um novo anúncio.",
      )
    }
  })

  it("exige pelo menos uma imagem para publicar", () => {
    const result = validateListingForm(
      validForm({ intent: "publish", images: "[]" }),
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.images).toBe(
        "Adicione pelo menos uma imagem para publicar o anúncio.",
      )
    }
  })

  it("mantém exatamente uma imagem principal", () => {
    const result = validateListingForm(
      validForm({
        images: JSON.stringify([
          buildImage({ storagePath: `${sellerId}/a.png`, isPrimary: true }),
          buildImage({
            storagePath: `${sellerId}/b.png`,
            sortOrder: 1,
            isPrimary: true,
          }),
        ]),
      }),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.images.filter((image) => image.isPrimary)).toHaveLength(
        1,
      )
      expect(result.data.images[0].isPrimary).toBe(true)
    }
  })

  it("promove a primeira imagem quando nenhuma é marcada", () => {
    const result = validateListingForm(
      validForm({
        images: JSON.stringify([
          buildImage({ storagePath: `${sellerId}/a.png`, isPrimary: false }),
          buildImage({
            storagePath: `${sellerId}/b.png`,
            sortOrder: 1,
            isPrimary: false,
          }),
        ]),
      }),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.images[0].isPrimary).toBe(true)
      expect(result.data.images[1].isPrimary).toBe(false)
    }
  })

  it("rejeita listas de imagens inválidas", () => {
    const notJson = validateListingForm(validForm({ images: "não-json" }))

    expect(notJson.ok).toBe(false)
    if (!notJson.ok) {
      expect(notJson.errors.images).toBe(
        "Não foi possível ler as imagens do anúncio.",
      )
    }

    const duplicated = validateListingForm(
      validForm({
        images: JSON.stringify([
          buildImage(),
          buildImage({ sortOrder: 1, isPrimary: false }),
        ]),
      }),
    )

    expect(duplicated.ok).toBe(false)
    if (!duplicated.ok) {
      expect(duplicated.errors.images).toBe(
        "Uma imagem foi enviada mais de uma vez.",
      )
    }
  })

  it("rejeita mais imagens que o limite", () => {
    const images = Array.from({ length: LISTING_IMAGE_MAX_COUNT + 1 }, (_, index) =>
      buildImage({
        storagePath: `${sellerId}/photo-${index}.png`,
        sortOrder: index,
        isPrimary: index === 0,
      }),
    )

    const result = validateListingForm(
      validForm({ images: JSON.stringify(images) }),
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.images).toBe(
        `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`,
      )
    }
  })
})

describe("validateListingImageFile", () => {
  it("aceita JPG, PNG e WebP dentro do limite", () => {
    expect(validateListingImageFile(fileWith("image/jpeg", 1024))).toEqual({
      ok: true,
    })
    expect(validateListingImageFile(fileWith("image/png", 1024))).toEqual({
      ok: true,
    })
    expect(validateListingImageFile(fileWith("image/webp", 1024))).toEqual({
      ok: true,
    })
  })

  it("rejeita formatos não suportados", () => {
    expect(
      validateListingImageFile(fileWith("image/gif", 1024, "photo.gif")),
    ).toEqual({
      ok: false,
      error: "Formato não suportado. Use JPG, PNG ou WebP.",
    })
  })

  it("rejeita arquivos vazios ou acima do limite", () => {
    expect(validateListingImageFile(fileWith("image/png", 0))).toEqual({
      ok: false,
      error: "O arquivo de imagem está vazio.",
    })
    expect(
      validateListingImageFile(fileWith("image/png", LISTING_IMAGE_MAX_BYTES + 1)),
    ).toEqual({
      ok: false,
      error: "A imagem deve ter no máximo 5 MB.",
    })
  })
})

describe("isListingImageExtensionAllowed", () => {
  it("aceita as extensões suportadas", () => {
    expect(isListingImageExtensionAllowed(`${sellerId}/photo.png`)).toBe(true)
    expect(isListingImageExtensionAllowed(`${sellerId}/photo.JPG`)).toBe(true)
    expect(isListingImageExtensionAllowed(`${sellerId}/photo.webp`)).toBe(true)
  })

  it("rejeita extensões desconhecidas", () => {
    expect(isListingImageExtensionAllowed(`${sellerId}/photo.gif`)).toBe(false)
    expect(isListingImageExtensionAllowed(`${sellerId}/photo`)).toBe(false)
  })
})

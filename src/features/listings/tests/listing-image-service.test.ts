import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  LISTING_IMAGE_MAX_ALT_LENGTH,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MAX_COUNT,
} from "../constants"
import { validateListingImagesForUser } from "../services/listing-image.service"
import { sellerId } from "./fixtures"

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  info: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: supabaseMocks.createClient,
}))

function imageInput(overrides: Partial<{
  storagePath: string
  altText: string | null
  sortOrder: number
  isPrimary: boolean
}> = {}) {
  return {
    storagePath: `${sellerId}/photo-1.png`,
    altText: null,
    sortOrder: 0,
    isPrimary: true,
    ...overrides,
  }
}

describe("validateListingImagesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMocks.createClient.mockResolvedValue({
      storage: {
        from: () => ({ info: supabaseMocks.info }),
      },
    })
    supabaseMocks.info.mockResolvedValue({
      data: { contentType: "image/png", size: 1024 },
      error: null,
    })
  })

  it("aceita uma lista vazia sem consultar o Storage", async () => {
    await expect(validateListingImagesForUser(sellerId, [])).resolves.toEqual({
      ok: true,
      data: [],
    })
    expect(supabaseMocks.createClient).not.toHaveBeenCalled()
    expect(supabaseMocks.info).not.toHaveBeenCalled()
  })

  it("rejeita mais imagens que o limite", async () => {
    const images = Array.from(
      { length: LISTING_IMAGE_MAX_COUNT + 1 },
      (_, index) =>
        imageInput({
          storagePath: `${sellerId}/photo-${index}.png`,
          sortOrder: index,
          isPrimary: index === 0,
        }),
    )

    await expect(
      validateListingImagesForUser(sellerId, images),
    ).resolves.toEqual({
      ok: false,
      error: `Você pode adicionar no máximo ${LISTING_IMAGE_MAX_COUNT} imagens.`,
    })
    expect(supabaseMocks.info).not.toHaveBeenCalled()
  })

  it("rejeita caminhos fora da pasta do usuário", async () => {
    const otherUser = "44444444-4444-4444-8444-444444444444"

    await expect(
      validateListingImagesForUser(sellerId, [
        imageInput({ storagePath: `${otherUser}/photo.png` }),
      ]),
    ).resolves.toEqual({
      ok: false,
      error: "Uma das imagens enviadas é inválida.",
    })
    expect(supabaseMocks.info).not.toHaveBeenCalled()
  })

  it("rejeita travessia de diretório e extensões desconhecidas", async () => {
    for (const storagePath of [
      `${sellerId}/../${sellerId}/photo.png`,
      `${sellerId}/photo.gif`,
      `${sellerId}/photo`,
      "   ",
    ]) {
      await expect(
        validateListingImagesForUser(sellerId, [
          imageInput({ storagePath }),
        ]),
      ).resolves.toEqual({
        ok: false,
        error: "Uma das imagens enviadas é inválida.",
      })
    }

    expect(supabaseMocks.info).not.toHaveBeenCalled()
  })

  it("rejeita o mesmo caminho repetido", async () => {
    await expect(
      validateListingImagesForUser(sellerId, [
        imageInput(),
        imageInput({ sortOrder: 1, isPrimary: false }),
      ]),
    ).resolves.toEqual({
      ok: false,
      error: "Uma das imagens enviadas é inválida.",
    })
  })

  it("informa quando o arquivo não existe no Storage", async () => {
    supabaseMocks.info.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    })

    await expect(
      validateListingImagesForUser(sellerId, [imageInput()]),
    ).resolves.toEqual({
      ok: false,
      error:
        "Uma das imagens enviadas não foi encontrada. Remova-a e envie novamente.",
    })
  })

  it("rejeita content-type não suportado", async () => {
    supabaseMocks.info.mockResolvedValue({
      data: { contentType: "image/svg+xml", size: 1024 },
      error: null,
    })

    await expect(
      validateListingImagesForUser(sellerId, [imageInput()]),
    ).resolves.toEqual({
      ok: false,
      error:
        "Uma das imagens enviadas não é um arquivo JPG, PNG ou WebP válido de até 5 MB.",
    })
  })

  it("rejeita arquivos vazios ou acima do limite", async () => {
    for (const size of [0, LISTING_IMAGE_MAX_BYTES + 1]) {
      supabaseMocks.info.mockResolvedValue({
        data: { contentType: "image/png", size },
        error: null,
      })

      await expect(
        validateListingImagesForUser(sellerId, [imageInput()]),
      ).resolves.toEqual({
        ok: false,
        error:
          "Uma das imagens enviadas não é um arquivo JPG, PNG ou WebP válido de até 5 MB.",
      })
    }
  })

  it("normaliza ordem, imagem principal e texto alternativo", async () => {
    const longAlt = "x".repeat(LISTING_IMAGE_MAX_ALT_LENGTH + 50)

    const result = await validateListingImagesForUser(sellerId, [
      imageInput({
        storagePath: `${sellerId}/a.png`,
        altText: "  Frente  ",
        sortOrder: 99,
        isPrimary: false,
      }),
      imageInput({
        storagePath: `${sellerId}/b.png`,
        altText: longAlt,
        sortOrder: 99,
        isPrimary: true,
      }),
      imageInput({
        storagePath: `${sellerId}/c.png`,
        altText: "   ",
        sortOrder: 99,
        isPrimary: false,
      }),
    ])

    expect(result).toEqual({
      ok: true,
      data: [
        {
          storagePath: `${sellerId}/a.png`,
          altText: "Frente",
          sortOrder: 0,
          isPrimary: false,
        },
        {
          storagePath: `${sellerId}/b.png`,
          altText: "x".repeat(LISTING_IMAGE_MAX_ALT_LENGTH),
          sortOrder: 1,
          isPrimary: true,
        },
        {
          storagePath: `${sellerId}/c.png`,
          altText: null,
          sortOrder: 2,
          isPrimary: false,
        },
      ],
    })
  })

  it("promove a primeira imagem quando nenhuma é marcada como principal", async () => {
    const result = await validateListingImagesForUser(sellerId, [
      imageInput({
        storagePath: `${sellerId}/a.png`,
        isPrimary: false,
      }),
      imageInput({
        storagePath: `${sellerId}/b.png`,
        sortOrder: 1,
        isPrimary: false,
      }),
    ])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.map((image) => image.isPrimary)).toEqual([true, false])
    }
  })

  it("mantém apenas a primeira imagem marcada como principal", async () => {
    const result = await validateListingImagesForUser(sellerId, [
      imageInput({
        storagePath: `${sellerId}/a.png`,
        isPrimary: false,
      }),
      imageInput({
        storagePath: `${sellerId}/b.png`,
        sortOrder: 1,
        isPrimary: true,
      }),
      imageInput({
        storagePath: `${sellerId}/c.png`,
        sortOrder: 2,
        isPrimary: true,
      }),
    ])

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.map((image) => image.isPrimary)).toEqual([
        false,
        true,
        false,
      ])
    }
  })

  it("retorna um erro seguro quando o cliente Supabase falha", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    supabaseMocks.createClient.mockRejectedValue(
      new Error("Missing Supabase environment variables"),
    )

    await expect(
      validateListingImagesForUser(sellerId, [imageInput()]),
    ).resolves.toEqual({
      ok: false,
      error: "Uma das imagens enviadas é inválida.",
    })

    consoleError.mockRestore()
  })
})

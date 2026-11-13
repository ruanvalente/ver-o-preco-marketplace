import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createListing,
  deleteListing,
  getListingForOwner,
  getListingsForOwner,
  pauseListing,
  publishListing,
  updateListing,
} from "../services/listing.service"
import { categoryId, listingId, sellerId } from "./fixtures"

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  storageFrom: vi.fn(),
  getPublicUrl: vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.example.com/${path}` },
  })),
  remove: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: supabaseMocks.createClient,
}))

type QueryResult = {
  data: unknown
  error: unknown
}

type QueryMock = QueryResult & {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  neq: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  then: (
    onFulfilled: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise<unknown>
}

const QUERY_METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "eq",
  "neq",
  "order",
  "limit",
  "single",
  "maybeSingle",
] as const

/**
 * Reproduz o builder encadeável do Supabase: cada método retorna o próprio
 * builder e `await` resolve o resultado configurado.
 */
function createQuery(result: QueryResult): QueryMock {
  const query = {} as QueryMock

  Object.assign(query, result)
  query.then = (onFulfilled, onRejected) =>
    Promise.resolve(result).then(onFulfilled, onRejected)

  for (const method of QUERY_METHODS) {
    query[method] = vi.fn(() => query)
  }

  return query
}

function createRow(overrides: Record<string, unknown> = {}) {
  return {
    id: listingId,
    seller_id: sellerId,
    title: "iPhone 15 Pro 256GB Titânio Natural",
    description: "Aparelho em excelente estado.",
    price: "4500.00",
    condition: "like_new",
    city: "Belém",
    neighborhood: "Nazaré",
    status: "draft",
    created_at: "2026-10-29T12:00:00.000Z",
    updated_at: "2026-10-30T12:00:00.000Z",
    category: { id: categoryId, slug: "celulares", name: "Celulares" },
    images: [
      {
        id: "image-1",
        storage_path: `${sellerId}/photo-1.png`,
        alt_text: "Frente",
        sort_order: 0,
        is_primary: true,
      },
    ],
    ...overrides,
  }
}

const input = {
  title: "iPhone 15 Pro",
  description: "Excelente estado.",
  categoryId,
  price: 4500,
  condition: "like_new" as const,
  city: "Belém",
  neighborhood: "Nazaré",
}

const images = [
  {
    storagePath: `${sellerId}/photo-1.png`,
    altText: "Frente",
    sortOrder: 0,
    isPrimary: true,
  },
]

function mockClient() {
  supabaseMocks.createClient.mockResolvedValue({
    from: supabaseMocks.from,
    rpc: supabaseMocks.rpc,
    storage: {
      from: supabaseMocks.storageFrom,
    },
  })
}

describe("listing.service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMocks.from.mockReset()
    supabaseMocks.rpc.mockReset()
    supabaseMocks.remove.mockReset()

    supabaseMocks.rpc.mockResolvedValue({ data: null, error: null })
    supabaseMocks.remove.mockResolvedValue({ data: null, error: null })
    supabaseMocks.storageFrom.mockReturnValue({
      getPublicUrl: supabaseMocks.getPublicUrl,
      remove: supabaseMocks.remove,
    })

    mockClient()
  })

  describe("getListingForOwner", () => {
    it("filtra pelo id e pelo vendedor autenticado", async () => {
      const query = createQuery({ data: createRow(), error: null })
      supabaseMocks.from.mockReturnValue(query)

      const result = await getListingForOwner(sellerId, listingId)

      expect(supabaseMocks.from).toHaveBeenCalledWith("products")
      expect(query.eq).toHaveBeenCalledWith("id", listingId)
      expect(query.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(query.maybeSingle).toHaveBeenCalled()
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data?.title).toBe(createRow().title)
        expect(result.data?.images[0].url).toBe(
          `https://cdn.example.com/${sellerId}/photo-1.png`,
        )
      }
    })

    it("não consulta o banco quando o id não é um UUID", async () => {
      await expect(
        getListingForOwner(sellerId, "id-invalido"),
      ).resolves.toEqual({ ok: true, data: null })

      expect(supabaseMocks.createClient).not.toHaveBeenCalled()
      expect(supabaseMocks.from).not.toHaveBeenCalled()
    })

    it("retorna null quando o anúncio não existe ou é de outro usuário", async () => {
      const query = createQuery({ data: null, error: null })
      supabaseMocks.from.mockReturnValue(query)

      await expect(getListingForOwner(sellerId, listingId)).resolves.toEqual({
        ok: true,
        data: null,
      })
    })

    it("retorna um erro seguro quando a consulta falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const query = createQuery({ data: null, error: { message: "denied" } })
      supabaseMocks.from.mockReturnValue(query)

      await expect(getListingForOwner(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar o anúncio.",
      })

      consoleError.mockRestore()
    })
  })

  describe("getListingsForOwner", () => {
    it("lista apenas os anúncios do usuário, mais recentes primeiro", async () => {
      const query = createQuery({ data: [createRow()], error: null })
      supabaseMocks.from.mockReturnValue(query)

      const result = await getListingsForOwner(sellerId)

      expect(query.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(query.neq).toHaveBeenCalledWith("status", "removed")
      expect(query.order).toHaveBeenCalledWith("updated_at", {
        ascending: false,
      })
      expect(query.limit).toHaveBeenCalledWith(100)
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].image?.storagePath).toBe(
          `${sellerId}/photo-1.png`,
        )
      }
    })

    it("limita a consulta a no máximo 200 registros", async () => {
      const query = createQuery({ data: [], error: null })
      supabaseMocks.from.mockReturnValue(query)

      await getListingsForOwner(sellerId, 500)
      expect(query.limit).toHaveBeenCalledWith(200)

      await getListingsForOwner(sellerId, 0)
      expect(query.limit).toHaveBeenLastCalledWith(1)
    })

    it("retorna um erro seguro quando a consulta falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const query = createQuery({ data: null, error: { message: "boom" } })
      supabaseMocks.from.mockReturnValue(query)

      await expect(getListingsForOwner(sellerId)).resolves.toEqual({
        ok: false,
        error: "Não foi possível carregar o anúncio.",
      })

      consoleError.mockRestore()
    })
  })

  describe("createListing", () => {
    it("cria como rascunho, associa imagens e publica quando solicitado", async () => {
      const insertQuery = createQuery({
        data: { id: listingId },
        error: null,
      })
      const publishQuery = createQuery({ data: null, error: null })
      const reloadQuery = createQuery({
        data: createRow({ status: "active" }),
        error: null,
      })

      supabaseMocks.from
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(publishQuery)
        .mockReturnValueOnce(reloadQuery)

      const result = await createListing({
        userId: sellerId,
        input,
        images,
        publish: true,
      })

      expect(insertQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          seller_id: sellerId,
          category_id: categoryId,
          title: input.title,
          price: input.price,
          status: "draft",
        }),
      )
      expect(supabaseMocks.rpc).toHaveBeenCalledWith(
        "replace_product_images",
        {
          p_product_id: listingId,
          p_images: [
            {
              storage_path: `${sellerId}/photo-1.png`,
              alt_text: "Frente",
              sort_order: 0,
              is_primary: true,
            },
          ],
        },
      )
      expect(publishQuery.update).toHaveBeenCalledWith({ status: "active" })
      expect(publishQuery.eq).toHaveBeenCalledWith("id", listingId)
      expect(publishQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data.status).toBe("active")
      }
    })

    it("mantém o rascunho quando a publicação não é solicitada", async () => {
      const insertQuery = createQuery({ data: { id: listingId }, error: null })
      const reloadQuery = createQuery({ data: createRow(), error: null })

      supabaseMocks.from
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(reloadQuery)

      const result = await createListing({
        userId: sellerId,
        input,
        images: [],
        publish: false,
      })

      expect(supabaseMocks.rpc).not.toHaveBeenCalled()
      expect(insertQuery.update).not.toHaveBeenCalled()
      expect(result.ok).toBe(true)
    })

    it("remove o anúncio quando a associação das imagens falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const insertQuery = createQuery({ data: { id: listingId }, error: null })
      const deleteQuery = createQuery({ data: null, error: null })

      supabaseMocks.from
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(deleteQuery)
      supabaseMocks.rpc.mockResolvedValue({
        data: null,
        error: { message: "rpc failed" },
      })

      const result = await createListing({
        userId: sellerId,
        input,
        images,
        publish: false,
      })

      expect(result).toEqual({
        ok: false,
        error: "Não foi possível salvar as imagens do anúncio.",
        field: "images",
      })
      expect(deleteQuery.delete).toHaveBeenCalled()
      expect(deleteQuery.eq).toHaveBeenCalledWith("id", listingId)
      expect(deleteQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)

      consoleError.mockRestore()
    })

    it("retorna um erro seguro quando o insert falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const insertQuery = createQuery({
        data: null,
        error: { message: "insert failed" },
      })
      supabaseMocks.from.mockReturnValueOnce(insertQuery)

      const result = await createListing({
        userId: sellerId,
        input,
        images,
        publish: false,
      })

      expect(result).toEqual({
        ok: false,
        error: "Não foi possível salvar o anúncio.",
      })
      expect(supabaseMocks.rpc).not.toHaveBeenCalled()

      consoleError.mockRestore()
    })

    it("informa o rascunho salvo quando a publicação falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const insertQuery = createQuery({ data: { id: listingId }, error: null })
      const publishQuery = createQuery({
        data: null,
        error: { message: "publish failed" },
      })

      supabaseMocks.from
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(publishQuery)

      const result = await createListing({
        userId: sellerId,
        input,
        images: [],
        publish: true,
      })

      expect(result).toEqual({
        ok: false,
        error:
          "O anúncio foi salvo como rascunho, mas não foi possível publicá-lo.",
        listingId,
      })

      consoleError.mockRestore()
    })
  })

  describe("updateListing", () => {
    it("rejeita ids inválidos sem consultar o banco", async () => {
      await expect(
        updateListing({
          userId: sellerId,
          listingId: "id-invalido",
          input,
          images,
          publish: false,
        }),
      ).resolves.toEqual({
        ok: false,
        error: "Anúncio não encontrado ou sem permissão para editá-lo.",
      })

      expect(supabaseMocks.createClient).not.toHaveBeenCalled()
    })

    it("não edita anúncio de outro usuário", async () => {
      const query = createQuery({ data: null, error: null })
      supabaseMocks.from.mockReturnValue(query)

      await expect(
        updateListing({
          userId: sellerId,
          listingId,
          input,
          images,
          publish: false,
        }),
      ).resolves.toEqual({
        ok: false,
        error: "Anúncio não encontrado ou sem permissão para editá-lo.",
      })

      expect(query.update).not.toHaveBeenCalled()
      expect(supabaseMocks.rpc).not.toHaveBeenCalled()
    })

    it("atualiza os campos, substitui as imagens e limpa arquivos removidos", async () => {
      const currentQuery = createQuery({
        data: createRow({
          images: [
            {
              id: "image-1",
              storage_path: `${sellerId}/photo-1.png`,
              alt_text: "Frente",
              sort_order: 0,
              is_primary: true,
            },
            {
              id: "image-2",
              storage_path: `${sellerId}/photo-2.png`,
              alt_text: "Traseira",
              sort_order: 1,
              is_primary: false,
            },
            {
              id: "image-3",
              storage_path: "/products/seed.png",
              alt_text: null,
              sort_order: 2,
              is_primary: false,
            },
          ],
        }),
        error: null,
      })
      const updateQuery = createQuery({ data: null, error: null })
      const reloadQuery = createQuery({
        data: createRow({ status: "active" }),
        error: null,
      })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)
        .mockReturnValueOnce(reloadQuery)

      const result = await updateListing({
        userId: sellerId,
        listingId,
        input,
        images,
        publish: true,
      })

      expect(updateQuery.update).toHaveBeenCalledWith({
        category_id: categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        condition: input.condition,
        city: input.city,
        neighborhood: input.neighborhood,
        status: "active",
      })
      expect(updateQuery.eq).toHaveBeenCalledWith("id", listingId)
      expect(updateQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(supabaseMocks.rpc).toHaveBeenCalledWith(
        "replace_product_images",
        expect.objectContaining({ p_product_id: listingId }),
      )

      // Apenas arquivos do próprio usuário são removidos do Storage.
      expect(supabaseMocks.storageFrom).toHaveBeenCalledWith("product-images")
      expect(supabaseMocks.remove).toHaveBeenCalledWith([
        `${sellerId}/photo-2.png`,
      ])
      expect(result.ok).toBe(true)
    })

    it("não desfaz a edição quando a limpeza do Storage falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const currentQuery = createQuery({
        data: createRow({
          images: [
            {
              id: "image-1",
              storage_path: `${sellerId}/photo-1.png`,
              alt_text: "Frente",
              sort_order: 0,
              is_primary: true,
            },
            {
              id: "image-2",
              storage_path: `${sellerId}/photo-2.png`,
              alt_text: null,
              sort_order: 1,
              is_primary: false,
            },
          ],
        }),
        error: null,
      })
      const updateQuery = createQuery({ data: null, error: null })
      const reloadQuery = createQuery({ data: createRow(), error: null })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)
        .mockReturnValueOnce(reloadQuery)
      supabaseMocks.remove.mockResolvedValue({
        data: null,
        error: { message: "storage failed" },
      })

      const result = await updateListing({
        userId: sellerId,
        listingId,
        input,
        images,
        publish: false,
      })

      expect(result.ok).toBe(true)

      consoleError.mockRestore()
    })

    it("sinaliza quando os campos salvam mas as imagens falham", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const currentQuery = createQuery({ data: createRow(), error: null })
      const updateQuery = createQuery({ data: null, error: null })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)
      supabaseMocks.rpc.mockResolvedValue({
        data: null,
        error: { message: "rpc failed" },
      })

      const result = await updateListing({
        userId: sellerId,
        listingId,
        input,
        images,
        publish: false,
      })

      expect(result).toEqual({
        ok: false,
        error:
          "Os dados do anúncio foram salvos, mas não foi possível atualizar as imagens. Revise as imagens e tente novamente.",
        listingId,
        field: "images",
      })
      expect(supabaseMocks.remove).not.toHaveBeenCalled()

      consoleError.mockRestore()
    })

    it("retorna um erro seguro quando a atualização dos campos falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const currentQuery = createQuery({ data: createRow(), error: null })
      const updateQuery = createQuery({
        data: null,
        error: { message: "update failed" },
      })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)

      const result = await updateListing({
        userId: sellerId,
        listingId,
        input,
        images,
        publish: false,
      })

      expect(result).toEqual({
        ok: false,
        error: "Não foi possível salvar o anúncio.",
        listingId,
      })
      expect(supabaseMocks.rpc).not.toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe("publishListing", () => {
    it("exige pelo menos uma imagem para publicar", async () => {
      const query = createQuery({
        data: createRow({ images: [] }),
        error: null,
      })
      supabaseMocks.from.mockReturnValue(query)

      await expect(publishListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Adicione pelo menos uma imagem antes de publicar o anúncio.",
        listingId,
      })
      expect(query.update).not.toHaveBeenCalled()
    })

    it("publica apenas o anúncio do próprio usuário", async () => {
      const currentQuery = createQuery({ data: createRow(), error: null })
      const updateQuery = createQuery({ data: null, error: null })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)

      const result = await publishListing(sellerId, listingId)

      expect(updateQuery.update).toHaveBeenCalledWith({ status: "active" })
      expect(updateQuery.eq).toHaveBeenCalledWith("id", listingId)
      expect(updateQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data.status).toBe("active")
      }
    })

    it("retorna um erro seguro quando a publicação falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const currentQuery = createQuery({ data: createRow(), error: null })
      const updateQuery = createQuery({
        data: null,
        error: { message: "publish failed" },
      })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)

      await expect(publishListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error:
          "As alterações foram salvas, mas não foi possível publicar o anúncio.",
        listingId,
      })

      consoleError.mockRestore()
    })

    it("não publica anúncio de outro usuário", async () => {
      const query = createQuery({ data: null, error: null })
      supabaseMocks.from.mockReturnValue(query)

      await expect(publishListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Anúncio não encontrado ou sem permissão para editá-lo.",
      })
      expect(query.update).not.toHaveBeenCalled()
    })
  })

  describe("pauseListing", () => {
    it("pausa o anúncio do próprio usuário", async () => {
      const currentQuery = createQuery({
        data: createRow({ status: "active" }),
        error: null,
      })
      const updateQuery = createQuery({ data: null, error: null })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(updateQuery)

      const result = await pauseListing(sellerId, listingId)

      expect(updateQuery.update).toHaveBeenCalledWith({ status: "paused" })
      expect(updateQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(result.ok).toBe(true)

      if (result.ok) {
        expect(result.data.status).toBe("paused")
      }
    })

    it("não pausa anúncio de outro usuário", async () => {
      const query = createQuery({ data: null, error: null })
      supabaseMocks.from.mockReturnValue(query)

      await expect(pauseListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Anúncio não encontrado ou sem permissão para editá-lo.",
      })
      expect(query.update).not.toHaveBeenCalled()
    })
  })

  describe("deleteListing", () => {
    it("exclui o anúncio e apenas os arquivos do próprio usuário", async () => {
      const currentQuery = createQuery({
        data: createRow({
          images: [
            {
              id: "image-1",
              storage_path: `${sellerId}/photo-1.png`,
              alt_text: null,
              sort_order: 0,
              is_primary: true,
            },
            {
              id: "image-2",
              storage_path: `${sellerId}/photo-2.png`,
              alt_text: null,
              sort_order: 1,
              is_primary: false,
            },
            {
              id: "image-3",
              storage_path: "/products/seed.png",
              alt_text: null,
              sort_order: 2,
              is_primary: false,
            },
          ],
        }),
        error: null,
      })
      const deleteQuery = createQuery({ data: null, error: null })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(deleteQuery)

      const result = await deleteListing(sellerId, listingId)

      expect(deleteQuery.delete).toHaveBeenCalled()
      expect(deleteQuery.eq).toHaveBeenCalledWith("id", listingId)
      expect(deleteQuery.eq).toHaveBeenCalledWith("seller_id", sellerId)
      expect(supabaseMocks.remove).toHaveBeenCalledWith([
        `${sellerId}/photo-1.png`,
        `${sellerId}/photo-2.png`,
      ])
      expect(result).toEqual({ ok: true, data: { id: listingId } })
    })

    it("não exclui anúncio de outro usuário", async () => {
      const query = createQuery({ data: null, error: null })
      supabaseMocks.from.mockReturnValue(query)

      await expect(deleteListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Anúncio não encontrado ou sem permissão para editá-lo.",
      })
      expect(query.delete).not.toHaveBeenCalled()
      expect(supabaseMocks.remove).not.toHaveBeenCalled()
    })

    it("retorna um erro seguro quando a exclusão falha", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined)
      const currentQuery = createQuery({ data: createRow(), error: null })
      const deleteQuery = createQuery({
        data: null,
        error: { message: "delete failed" },
      })

      supabaseMocks.from
        .mockReturnValueOnce(currentQuery)
        .mockReturnValueOnce(deleteQuery)

      await expect(deleteListing(sellerId, listingId)).resolves.toEqual({
        ok: false,
        error: "Não foi possível excluir o anúncio.",
        listingId,
      })
      expect(supabaseMocks.remove).not.toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })
})

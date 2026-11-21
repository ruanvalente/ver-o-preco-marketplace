## 1. Objetivo

Remover o campo `removedImagePaths` do fluxo de formulário de anúncios da issue #76 (filha da #70, Phase 02 — Listings). O campo é produzido, serializado, validado e tipado, mas nunca consumido: as actions recalculam as remoções a partir do estado persistido no banco. Também eliminar o segundo serializador de imagens no formulário, passando a usar `getImagesPayload()` do hook.

## 2. Estado atual (diagnóstico)

- `use-listing-images.ts:116` mantém `removedImagePaths` em estado; `removeImage` (`:304-309`) acumula storage paths de imagens persistidas.
- `listing-form.tsx:215-227` serializa as imagens localmente (duplicando `getImagesPayload`) e serializa `removedImagePaths` para um input hidden (`:372-376`).
- `listing.schemas.ts:214-238` define `parseRemovedImagePaths`; `validateListingForm` (`:335-345`) o chama e inclui o resultado em `data`.
- `listing.types.ts:113` declara o campo em `ListingFormData`.
- `listing.actions.ts` desestrutura apenas `input`, `images`, `intent` e `listingId`: o campo é dead code.
- Testes afetados: `listing-schemas.test.ts` (fixtures), `listing-actions.test.ts` (fixture) e `listing-form.test.tsx` (FormData enviado).

## 2.1. Ajuste descoberto pelo TDD

O `getImagesPayload` do hook lia `imagesRef.current`, atualizado só em um efeito. Como o formulário serializa o payload durante o render, remover uma imagem deixava o input hidden com o payload anterior (o teste do seam 3 reproduziu isso). O serializador passou a ler o estado `images` com dependência `[images]`, mantendo uma única implementação e refletindo a remoção/ordenação no mesmo render. O `imagesRef` continua existindo para as operações assíncronas do hook.

## 3. Escopo aprovado

- `src/features/listings/hooks/use-listing-images.ts`: remover estado, atualização em `removeImage` e campo do tipo de retorno; manter `getImagesPayload` como serializador único, agora derivado do estado `images` (ver §2.1).
- `src/features/listings/components/listing-form.tsx`: desestruturar `getImagesPayload`, usá-lo para `serializedImages` e remover o input hidden e o serializador local.
- `src/features/listings/schemas/listing.schemas.ts`: remover `parseRemovedImagePaths`, a chamada, o erro `form` associado e o campo em `data`.
- `src/features/listings/types/listing.types.ts`: remover `removedImagePaths` de `ListingFormData`.
- Testes: remover o campo das fixtures e afirmar a nova forma nos seams abaixo.
- `docs/architecture/listings.md`: corrigir o bullet que ainda descrevia `removedImagePaths` (drift apontado pela revisão de segurança).
- Criar esta branch a partir de `develop`; TDD em fatias verticais; revisões com `architect`, `reviewer` e `security-reviewer`; quatro gates antes de propor commit/PR.

## 4. Não escopo

- Não alterar Server Actions, serialização Realtime, Supabase, RLS/Storage, schema, migrations, policies, dependências ou variáveis de ambiente.
- Não mudar copy da UI pt-BR, layout, acessibilidade, estados de loading/empty/error ou comportamento de upload/remoção/ordenação de imagens.
- Não renomear arquivos por convenção de sufixos (escopo da #84).

## 5. Critérios de aceite (BDD)

- **Dado** um formulário válido sem `removedImagePaths`, **quando** ele é validado, **então** o resultado é `ok` e `data` não contém o campo removido.
- **Dado** um formulário de criação preenchido, **quando** a action é chamada, **então** o `FormData` contém `images` e `intent`, mas não contém `removedImagePaths`.
- **Dado** um anúncio em edição com imagens persistidas, **quando** uma imagem é removida e o formulário é submetido, **então** o payload `images` enviado continua excluindo a imagem removida e preservando as demais.

## 6. Seams de teste (TDD)

1. `validateListingForm` (`listing-schemas.test.ts`): forma do resultado válido e ausência do campo.
2. `ListingForm` (`listing-form.test.tsx`):`FormData` submetido, sem o input hidden removido e com `images` intacto.
3. Fluxo do hook pelo formulário (`listing-form.test.tsx`, modo edição): remoção/ordenação de imagem refletida no payload através de `getImagesPayload`, sem testar o hook diretamente.

Cada fatia começa com teste vermelho; a implementação mínima vem logo depois. Títulos de teste em inglês; copy da UI permanece pt-BR.

## 7. Skills e MCPs

- `tdd` — carregada para conduzir o ciclo vermelho → verde em fatias verticais e confirmar os seams antes de escrever testes.
- `accessibility-compliance`, `documentation-and-adrs`, Context7 e Supabase MCP — não necessários: não há mudança de UI, ADR, API de biblioteca ou banco.
- Guia local `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` consultado: o formulário permanece Client Component e a fronteira com as Server Actions não muda.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, `git diff --check` e revisão independente antes de qualquer commit/push/PR.

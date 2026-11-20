# Phase 14 — Qualidade de Código

## Objetivo
Garantir DRY, KISS, SOLID, sem dead code, sem componentes grandes.

## Contexto atual
Uso de feature-first, mappers, services, actions, schemas.

## Problemas encontrados

### [P2] Componentes grandes (>200 lines)
**Arquivo:** `src/features/dashboard/components/seller-dashboard.tsx`, `src/features/products/components/catalog/products-catalog.tsx`
**Problema:** Mistura de dados e apresentação.
**Impacto:** Manutenibilidade.
**Por que:** Falta de separação.
**Solução:** Extrair subcomponentes.
**Arquivos envolvidos:** Modificar arquivos.

### [P2] Imports não utilizados
**Arquivo:** `src/features/profile/components/profile-avatar.tsx`, `src/features/profile/services/profile.actions.ts`, `src/features/profile/services/profile.service.ts`
**Problema:** Dead imports.
**Impacto:** Qualidade.
**Por que:** Lint warnings.
**Solução:** Remover imports.
**Arquivos envolvidos:** Modificar arquivos.

### [P3] `as unknown as` casts
**Arquivo:** `src/features/products/services/products.service.ts`, `src/features/chat/services/chat.service.ts`
**Problema:** Quebra de type safety.
**Impacto:** Qualidade.
**Por que:** Uso de casts.
**Solução:** Definir tipos de row.
**Arquivos envolvidos:** Modificar arquivos.

## Solução proposta
1. Extrair componentes.
2. Remover dead imports.
3. Definir tipos de row.

## Arquivos envolvidos
- Modificar: `seller-dashboard.tsx`, `products-catalog.tsx`, `profile-avatar.tsx`, `profile.actions.ts`, `profile.service.ts`, `products.service.ts`, `chat.service.ts`.

## Plano de implementação
1. Extrair componentes.
2. Remover imports.
3. Definir tipos.

## Componentização
- Extrair subcomponentes.

## Performance
- Nenhuma.

## Acessibilidade
- Nenhuma.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Nenhum.

## Critérios de aceite
- [ ] Sem componentes >200 lines.
- [ ] Sem lint warnings.
- [ ] Sem casts.

## Riscos
- Refatoração pode quebrar layout.

## Dependências
- Phase 01.

## Ordem de implementação
1. Extrair componentes.
2. Remover imports.
3. Definir tipos.

## Resultado da execução (Issue #29 — Phase 14)

> **Atualização (Issue #29 — Phase 14):** os critérios de aceite foram atendidos. `seller-dashboard.tsx` (109 linhas) e `products-catalog.tsx` (161 linhas) já estavam abaixo de 200 linhas; os imports mortos de `profile/*` foram resolvidos na issue #22; `products.service.ts` não continha mais casts (a auditoria estava desatualizada). Os cinco `as unknown as` restantes foram removidos: quatro em consultas `.from()` de `listing.service.ts` e `chat.service.ts` via `.select<Query, Row>()`, mesma convenção do plano 013 e das features de produtos/favoritos; o quinto, no RPC `get_chat_conversations`, virou guarda `Array.isArray`, padrão já usado por `getSellerChatMetrics` — um payload não-array passa a devolver lista vazia em vez de estourar no `.map()`. A tipagem das consultas é em tempo de compilação, sem nova dependência ou mudança no mapeamento. Também foram removidos os três warnings de lint ainda presentes em `src/` (`AuthHeader`, `ShieldCheck` e o `params` não usado em `generateMetadata`). `getChatConversations` passou a ter testes de mapeamento e de payload não-array; os mocks de builder não precisaram de ajuste porque generics são apagados em runtime.
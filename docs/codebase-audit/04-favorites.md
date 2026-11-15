# Phase 04 — Favoritos

## Objetivo
Permitir favoritar/desfavoritar produtos e listar favoritos.

## Contexto atual
Módulo `features/favorites/` com `favorites.service.ts`, `favorites.actions.ts` e componentes (`favorite-button`, `favorites-page`, `favorite-empty-state`, `favorite-error-state`, `favorites-skeleton`).

## Problemas encontrados

### [P1] `favorite-button.tsx` sem estado otimista
**Arquivo:** `src/features/favorites/components/favorite-button.tsx`
**Problema:** Ao favoritar/desfavoritar, o UI pode travar sem feedback visual.
**Impacto:** UX ruim.
**Por que:** Sem otimismo, o botão depende da resposta do servidor.
**Solução:** Adicionar estado otimista com rollback em caso de erro.
**Arquivos envolvidos:** `favorite-button.tsx`.

### [P1] `getFavoriteProductIds` sem cache
**Arquivo:** `src/features/favorites/services/favorites.service.ts`
**Problema:** Cada chamada aciona query RPC com filtro por `user_id`.
**Impacto:** Taxa extra de queries por página.
**Por que:** Chamado em cada render de catálogo.
**Solução:** Adicionar `cache()` do React no mesmo scope de requisição.
**Arquivos envolvidos:** `favorites.service.ts`.

## Solução proposta
1. Adicionar otimismo ao botão.
2. Adicionar `cache()` em `getFavoriteProductIds`.

## Arquivos envolvidos
- Modificar: `src/features/favorites/components/favorite-button.tsx`
- Modificar: `src/features/favorites/services/favorites.service.ts`

## Plano de implementação
1. Adicionar otimismo.
2. Adicionar `cache()`.

## Componentização
- Nenhuma nova abstração.

## Performance
- Reduzir queries duplicadas.

## Acessibilidade
- Botão com `aria-pressed` e label descritivo.

## Segurança
- RLS garante que só o dono vê favoritos.

## Supabase
- RLS existente.

## Testes
- Testes existentes: 3 arquivos em `features/favorites/tests`.

## Critérios de aceite
- [ ] Estado otimista presente.
- [ ] Sem query duplicada.

## Riscos
- Rollback complexo se a ação falhar.

## Dependências
- Phase 01.

## Ordem de implementação
1. Adicionar otimismo.
2. Adicionar cache.

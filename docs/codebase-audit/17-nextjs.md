# Phase 17 — Next.js

## Objetivo
Garantir App Router, Server/Client Components, SEO, caching, streaming.

## Contexto atual
Next.js 16.4.3, `proxy.ts`, `cacheComponents: true`, `partialPrefetching: true`, `turbopack`.

## Problemas encontrados

### [P2] SEO metadata em rotas dinâmicas ausentes
**Arquivo:** `src/app/(public)/products/[id]/page.tsx`, `src/app/(public)/profile/[id]/page.tsx`
**Problema:** Sem `metadata` export.
**Impacto:** SEO.
**Por que:** Falta de metadata.
**Solução:** Adicionar `metadata` dinâmico.
**Arquivos envolvidos:** Modificar arquivos.

### [P2] `proxy.ts` matcher pode não cobrir todos os casos
**Arquivo:** `proxy.ts`
**Problema:** Matcher pode faltar rotas.
**Impacto:** Redirecionamento.
**Por que:** Verificar.
**Solução:** Atualizar matcher.
**Arquivos envolvidos:** `proxy.ts`.

## Solução proposta
1. Adicionar metadata.
2. Atualizar matcher.

## Arquivos envolvidos
- Modificar: `products/[id]/page.tsx`, `profile/[id]/page.tsx`, `proxy.ts`.

## Plano de implementação
1. Adicionar metadata.
2. Atualizar matcher.

## Componentização
- Nenhuma.

## Performance
- Nenhuma.

## Acessibilidade
- Nenhuma.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Testes de SEO.

## Critérios de aceite
- [ ] Metadata em rotas dinâmicas.
- [ ] Matcher cobre rotas.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Adicionar metadata.
2. Atualizar matcher.
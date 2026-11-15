# Phase 09 — Performance

## Objetivo
Garantir LCP, INP, CLS, TTFB, FCP saudáveis.

## Contexto atual
Uso de Server Components, `use cache`, `cacheTag`, `cacheLife`, `next/image`, `partialPrefetching`, `turbopack`.

## Problemas encontrados

### [P1] Ausência de medições de performance
**Arquivo:** Não existe instrumentação.
**Problema:** Nenhum benchmark de LCP/INP/CLS/TTFB.
**Impacto:** Não é possível validar melhorias.
**Por que:** Falta de observabilidade.
**Solução:** Adicionar instrumentação com `next/speed` ou Lighthouse CI.
**Arquivos envolvidos:** Criar `instrumentation.ts` e CI.

### [P1] Cache de catálogo pode servir dados antigos
**Arquivo:** `src/features/products/services/products.service.ts`
**Problema:** `cacheTag` sem invalidação explícita em mutações.
**Impacto:** Catálogo desatualizado.
**Por que:** Falta de `revalidateTag`.
**Solução:** Adicionar `revalidateTag("products:list")` em actions de listings.
**Arquivos envolvidos:** `products.service.ts`, `listing.actions.ts`.

### [P2] Imagens de produto sem `priority` em listas grandes
**Arquivo:** `src/features/products/components/product-card.tsx`
**Problema:** Muitas imagens `next/image` sem `priority` podem atrasar LCP.
**Impacto:** LCP alto.
**Por que:** Lazy loading excessivo.
**Solução:** Usar `priority` nas primeiras imagens visíveis.
**Arquivos envolvidos:** `product-card.tsx`.

## Solução proposta
1. Instrumentar performance.
2. Invalidar cache de catálogo.
3. Ajustar `priority` de imagens.

## Arquivos envolvidos
- Criar: `instrumentation.ts`, CI config.
- Modificar: `products.service.ts`, `listing.actions.ts`, `product-card.tsx`.

## Plano de implementação
1. Adicionar instrumentação.
2. Adicionar `revalidateTag`.
3. Ajustar `priority`.

## Componentização
- Nenhuma.

## Performance
- Melhoria esperada: LCP, TTFB.

## Acessibilidade
- Nenhuma.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Testes de Lighthouse CI.

## Critérios de aceite
- [ ] Instrumentação ativa.
- [ ] Cache invalidado.
- [ ] LCP < 2.5s.

## Riscos
- Cache agressivo pode servir dados antigos.

## Dependências
- Phase 01.

## Ordem de implementação
1. Instrumentar.
2. Invalidar cache.
3. Ajustar imagens.

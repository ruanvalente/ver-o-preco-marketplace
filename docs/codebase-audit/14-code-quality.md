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
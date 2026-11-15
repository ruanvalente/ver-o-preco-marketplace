# Phase 19 — Arquitetura

## Objetivo
Garantir consistência de arquitetura, domain boundaries, padrões de design e design system.

## Contexto atual
Feature-first com `src/features/*`, componentes em `src/components/ui/*`, layout em `src/components/layout/*`, hooks em `src/hooks/*`, lib em `src/lib/*` (Supabase, utils), config em `src/config/*`, teste em `src/test/*`. Padrões: Server Components, Supabase Auth, RLS, public client, middleware.

## Problemas encontrados

### [P2] Design System inconsistente
**Arquivo:** `src/components/ui/*` vs design tokens em `DESIGN.md`.
**Problema:** Não verificado.
**Impacto:** UI inconsistente.
**Solução:** Revisar DESIGN.md.
**Arquivos envolvidos:** `DESIGN.md`, componentes UI.

### [P3] Separação de preocupações inconsistente
**Arquivo:** Alguns componentes misturam dados e UI.
**Problema:** Falta de domain mappers.
**Impacto:** Baixa manutenibilidade.
**Solução:** Adicionar mappers onde necessário.
**Arquivos envolvidos:** Componentes.

## Solução proposta
1. Revisar DESIGN.md.
2. Adicionar mappers.

## Arquivos envolvidos
- Revisar DESIGN.md.

## Plano de implementação
1. Revisar design system.
2. Adicionar mappers.

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
- Nenhum.

## Critérios de aceite
- [ ] Design system consistente.
- [ ] Separação de preocupações.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Revisar design system.
2. Adicionar mappers.

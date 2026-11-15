# Phase 16 — React

## Objetivo
Garantir uso correto de hooks, Server/Client Components, estado, derived state.

## Contexto atual
Uso de Server Components por padrão, `"use client"` apenas onde necessário, hooks como `useFocusFirstError`, `useChatRealtime`.

## Problemas encontrados

### [P2] `useFocusFirstError` pode disparar loop
**Arquivo:** `src/features/auth/hooks/use-focus-first-error.ts`
**Problema:** `useEffect` com dependências `[state, fields]`; se `fields` for um array novo a cada render, pode loop.
**Impacto:** Performance.
**Por que:** Dependência instável.
**Solução:** Estabilizar `fields` com `useMemo`.
**Arquivos envolvidos:** `use-focus-first-error.ts`.

### [P2] `useChatRealtime` pode não limpar inscrições
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Cleanup de inscrições pode faltar.
**Impacto:** Memory leak.
**Por que:** Falta de cleanup.
**Solução:** Adicionar cleanup.
**Arquivos envolvidos:** `use-chat-realtime.ts`.

## Solução proposta
1. Estabilizar dependências.
2. Adicionar cleanup.

## Arquivos envolvidos
- Modificar: `use-focus-first-error.ts`, `use-chat-realtime.ts`.

## Plano de implementação
1. Estabilizar dependências.
2. Adicionar cleanup.

## Componentização
- Nenhuma.

## Performance
- Melhoria.

## Acessibilidade
- Nenhuma.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Nenhum.

## Critérios de aceite
- [ ] Sem loops.
- [ ] Sem memory leaks.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Estabilizar dependências.
2. Adicionar cleanup.
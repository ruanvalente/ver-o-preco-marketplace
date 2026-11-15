# Phase 13 — Testes

## Objetivo
Garantir cobertura de testes em unit, integration e E2E.

## Contexto atual
Vitest + Testing Library. Testes em auth (7), products (9), listings (7), favorites (3), chat (3), dashboard (4), profile (1), landing (1).

## Problemas encontrados

### [P1] Testes de chat storage ausentes
**Arquivo:** `src/features/chat/tests/`
**Problema:** Sem teste para `getChatImageUrl`, `uploadChatImage`, `deleteChatImage`.
**Impacto:** Risco de regressão em storage.
**Por que:** Falta de testes.
**Solução:** Adicionar testes.
**Arquivos envolvidos:** `chat-storage.service.ts`.

### [P1] Testes de realtime ausentes
**Arquivo:** `src/features/chat/tests/`
**Problema:** Sem teste para `use-chat-realtime.ts`.
**Impacto:** Risco de regressão em realtime.
**Por que:** Falta de testes.
**Solução:** Adicionar testes.
**Arquivos envolvidos:** `use-chat-realtime.ts`.

### [P1] Testes de dashboard actions ausentes
**Arquivo:** `src/features/dashboard/tests/`
**Problema:** Sem teste para `dashboard.service.ts`.
**Impacto:** Risco de regressão.
**Por que:** Falta de testes.
**Solução:** Adicionar testes.
**Arquivos envolvidos:** `dashboard.service.ts`.

### [P2] Testes E2E ausentes
**Arquivo:** `src/test/`
**Problema:** Sem Playwright/Cypress.
**Impacto:** Fluxos críticos sem validação.
**Por que:** Falta de infraestrutura.
**Solução:** Adicionar Playwright.
**Arquivos envolvidos:** Criar `playwright.config.ts`.

## Solução proposta
1. Adicionar testes de chat storage.
2. Adicionar testes de realtime.
3. Adicionar testes de dashboard.
4. Adicionar Playwright.

## Arquivos envolvidos
- Criar: `chat-storage.test.ts`, `use-chat-realtime.test.ts`, `dashboard.service.test.ts`, `playwright.config.ts`.

## Plano de implementação
1. Adicionar testes unitários.
2. Adicionar Playwright.

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
- Adicionar testes.

## Critérios de aceite
- [ ] Cobertura de chat storage.
- [ ] Cobertura de realtime.
- [ ] Cobertura de dashboard.
- [ ] Playwright configurado.

## Riscos
- Testes frágeis em realtime.

## Dependências
- Phase 01.

## Ordem de implementação
1. Adicionar testes unitários.
2. Adicionar Playwright.
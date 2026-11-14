# Phase 06 — Dashboard

## Objetivo
Visão geral do usuário com métricas, listings recentes, mensagens recentes.

## Contexto atual
Módulo `features/dashboard/` com `dashboard.service.ts` e componentes (`seller-dashboard`, `dashboard-metrics`, `dashboard-listings`, `dashboard-resource-cards`, `dashboard-status-button`, `dashboard-trust-card`).

## Problemas encontrados

### [P1] `dashboard.service.ts` sem testes de unidade
**Arquivo:** `src/features/dashboard/services/dashboard.service.ts`
**Problema:** Service pode ter falhas silenciosas.
**Impacto:** Risco de regressão.
**Por que:** Falta de testes.
**Solução:** Adicionar testes unitários.
**Arquivos envolvidos:** `dashboard.service.ts`.

### [P2] Componentes podem estar excessivamente grandes
**Arquivo:** `src/features/dashboard/components/seller-dashboard.tsx`
**Problema:** Componente grande > 200 lines.
**Impacto:** Manutenibilidade.
**Por que:** Mistura de lógica e apresentação.
**Solução:** Extrair subcomponentes.
**Arquivos envolvidos:** `seller-dashboard.tsx`.

## Solução proposta
1. Adicionar testes para service.
2. Extrair subcomponentes.

## Arquivos envolvidos
- Modificar: `dashboard.service.ts`, `seller-dashboard.tsx`
- Criar: `dashboard.service.test.ts`

## Plano de implementação
1. Adicionar testes.
2. Extrair componentes.

## Componentização
- Extrair `DashboardMetrics`, `DashboardListings` (já existem).

## Performance
- Nenhuma mudança.

## Acessibilidade
- Verificar foco em botões de status.

## Segurança
- RLS garante dados do usuário.

## Supabase
- RLS existente.

## Testes
- Adicionar testes unitários.

## Critérios de aceite
- [ ] Cobertura de testes.

## Riscos
- Refatoração pode quebrar layout.

## Dependências
- Phase 01.

## Ordem de implementação
1. Adicionar testes.
2. Extrair componentes.

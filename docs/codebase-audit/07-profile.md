# Phase 07 — Perfil

## Objetivo
Gerenciar perfil próprio e visualizar perfil público.

## Contexto atual
Módulo `features/profile/` com serviços (`profile.service.ts`, `profile.actions.ts`, `profile-storage.service.ts`) e componentes (`profile-page`, `profile-form`, `profile-avatar`, `public-profile-page`).

## Problemas encontrados

### [P2] Lint warnings de variáveis não utilizadas
**Arquivo:** `src/features/profile/components/profile-avatar.tsx`, `src/features/profile/services/profile.actions.ts`, `src/features/profile/services/profile.service.ts`
**Problema:** Variáveis de erro e imports não utilizados.
**Impacto:** Qualidade de código.
**Por que:** Dead code.
**Solução:** Remover imports não utilizadas.
**Arquivos envolvidos:** Modificar três arquivos.

### [P2] `profile.service.ts` importa `mapAuthError` sem usar
**Arquivo:** `src/features/profile/services/profile.service.ts`
**Problema:** Dead import.
**Impacto:** Qualidade.
**Solução:** Remover import.

## Solução proposta
1. Remover imports não utilizadas.

## Arquivos envolvidos
- Modificar: `profile-avatar.tsx`, `profile.actions.ts`, `profile.service.ts`

## Plano de implementação
1. Remover imports.

## Componentização
- Nenhuma.

## Performance
- Nenhuma.

## Acessibilidade
- Verificar foco em formulário de perfil.

## Segurança
- RLS garante dados do usuário.

## Supabase
- RLS existente.

## Testes
- Testes existentes: `profile.schemas.test.ts`.

## Critérios de aceite
- [ ] Sem lint warnings.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Remover imports.

## Resultado da execução (Issue #22 — Phase 07)

> **Atualização (Issue #22 — Phase 07):** os três warnings de lint foram resolvidos. `catch (error)` sem uso virou `catch {` em `profile-avatar.tsx` e em `updateProfileAction` (`profile.actions.ts`); o import não usado de `mapAuthError` foi removido de `profile.service.ts`. O binding `error` de `updateAvatarAction` foi mantido porque alimenta o `console.error`. Nenhuma mudança de comportamento, RLS ou Storage; `profile.schemas.test.ts` permanece como teste de regressão da feature.

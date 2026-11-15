# Phase 11 — Segurança

## Objetivo
Garantir autenticação, autorização, RLS, proteção de dados e secrets.

## Contexto atual
Supabase Auth com PKCE, RLS em todas as tabelas, `proxy.ts` para sessão, `safeRedirectPath` contra open redirect, `validateEnv` para variáveis.

## Problemas encontrados

### [P0] Chat signed URL sem verificação de participação
**Arquivo:** `src/features/chat/services/chat-storage.service.ts`
**Problema:** `getChatImageUrl` assina qualquer caminho.
**Impacto:** Vazamento de imagens privadas.
**Por que:** Falta de verificação de participação.
**Solução:** Adicionar RPC `check_conversation_participant`.
**Arquivos envolvidos:** `chat-storage.service.ts`, `chat.service.ts`.

### [P0] Server Actions sem double-check de ownership
**Arquivo:** `src/features/*/services/*.actions.ts`
**Problema:** Actions confiam em `getCurrentUser` sem verificar propriedade da entidade.
**Impacto:** Possível edição de dados alheios se RLS falhar.
**Por que:** Falta de double-check.
**Solução:** Adicionar `requireOwnership`.
**Arquivos envolvidos:** Todas as actions.

### [P0] Políticas de bucket de storage podem estar ausentes
**Arquivo:** `migrations/0009.sql`
**Problema:** Bucket `product-images` pode não ter políticas RLS explícitas.
**Impacto:** Acesso público a imagens.
**Por que:** Políticas não verificadas.
**Solução:** Adicionar políticas `FOR SELECT` e `FOR INSERT`.
**Arquivos envolvidos:** `migrations/0010.sql`.

## Solução proposta
1. Verificar participação para URLs assinadas.
2. Adicionar `requireOwnership`.
3. Adicionar políticas de bucket.

## Arquivos envolvidos
- Modificar: `chat-storage.service.ts`, `chat.service.ts`, todas as actions.
- Criar: `migrations/0010.sql`.

## Plano de implementação
1. Criar RPC `check_conversation_participant`.
2. Atualizar `chat-storage.service.ts`.
3. Adicionar `requireOwnership` em actions.
4. Migrar políticas de bucket.

## Componentização
- Nenhuma.

## Performance
- Nenhuma.

## Acessibilidade
- Nenhuma.

## Segurança
- Melhoria direta.

## Supabase
- Adicionar RPC e políticas.

## Testes
- Testes de segurança para ações e storage.

## Critérios de aceite
- [ ] URLs assinadas verificam participação.
- [ ] Actions verificam ownership.
- [ ] Políticas de bucket presentes.

## Riscos
- Latência adicional da verificação.

## Dependências
- Phase 01.

## Ordem de implementação
1. Criar RPC.
2. Atualizar storage.
3. Adicionar `requireOwnership`.
4. Migrar políticas.

# Phase 05 — Chat

## Objetivo
Conversa entre comprador e vendedor sobre produto, com texto/imagens, realtime, presença, digitação e leitura.

## Contexto atual
Módulo `features/chat/` com serviços (`chat.service.ts`, `chat-storage.service.ts`, `chat.actions.ts`), hook `use-chat-realtime.ts`, schemas `chat.schemas.ts`, types `chat.types.ts`, constants, e componentes (`chat-window`, `message-list`, `message-composer`, `conversation-list`, `chat-header`, `product-context`, `start-conversation-button`, `retry-button`).

## Problemas encontrados

### [P0] Signed URL não verifica participação
**Arquivo:** `src/features/chat/services/chat-storage.service.ts`
**Problema:** `getChatImageUrl` assina qualquer caminho sem verificar se o usuário pertence à conversa.
**Impacto:** Vazamento de imagens privadas.
**Por que:** A assinatura de URL é temporária, mas não há filtro de participação.
**Solução:** Adicionar RPC `check_conversation_participant` e verificar antes de assinar.
**Arquivos envolvidos:** `chat-storage.service.ts`, `chat.service.ts`, `chat.actions.ts`.

### [P0] Hook `use-chat-realtime.ts` pode não filtrar corretamente
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Canais de realtime não filtrados por conversa/usuário.
**Impacto:** Ruído de outras conversas.
**Por que:** Filtro incorreto de canais.
**Solução:** Filtrar por `conversationId` e `userId`.
**Arquivos envolvidos:** `use-chat-realtime.ts`.

### [P1] Erros de realtime sem retry
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Sem reconexão com backoff.
**Impacto:** Mensagens perdidas.
**Por que:** Falta de retry.
**Solução:** Implementar retry exponencial.
**Arquivos envolvidos:** `use-chat-realtime.ts`.

### [P1] `getSellerChatMetrics` faz 3 queries separadas
**Arquivo:** `src/features/chat/services/chat.service.ts`
**Problema:** Promise.all com 3 queries; pode ser otimizado com uma RPC.
**Impacto:** Overhead.
**Por que:** Múltiplas round-trips.
**Solução:** Criar RPC `get_seller_chat_metrics` que retorne os 3 valores.
**Arquivos envolvidos:** `chat.service.ts`.

## Solução proposta
1. Adicionar verificação de participação para URLs assinadas.
2. Filtrar canais de realtime.
3. Adicionar retry.
4. Otimizar métricas com RPC.

## Arquivos envolvidos
- Modificar: `chat-storage.service.ts`, `chat.service.ts`, `chat.actions.ts`, `use-chat-realtime.ts`
- Criar: RPC `check_conversation_participant` e `get_seller_chat_metrics` no Supabase.

## Plano de implementação
1. Criar RPCs no Supabase.
2. Atualizar `chat-storage.service.ts`.
3. Atualizar `use-chat-realtime.ts`.
4. Atualizar `chat.service.ts`.

## Componentização
- Nenhuma nova abstração.

## Performance
- Reduzir round-trips.

## Acessibilidade
- `aria-live` para novas mensagens.

## Segurança
- Verificação de participação.

## Supabase
- Adicionar RPCs.

## Testes
- Adicionar testes para storage, realtime, métricas.

## Critérios de aceite
- [ ] URLs assinadas verificam participação.
- [ ] Canais filtrados.
- [ ] Retry de conexão.
- [ ] Métricas com 1 query.

## Riscos
- Latência adicional da verificação.

## Dependências
- Phase 01.

## Ordem de implementação
1. Criar RPCs.
2. Atualizar storage.
3. Atualizar realtime.
4. Atualizar métricas.

# Phase 03 — Listings

## Objetivo
Permitir criar, editar, publicar, pausar, marcar como vendido, remover anúncios e gerenciar imagens.

## Contexto atual
Módulo `features/listings/` com serviços `listing.service.ts`, `listing.actions.ts`, `listing-storage.service.ts` e componentes (`listing-form`, `image-uploader`, `listing-card`, `listing-preview`, `listing-status-badge`).

## Problemas encontrados

### [P0] Missing ownership validation in listing actions
**Arquivo:** `src/features/listings/services/listing.actions.ts`
**Problema:** Server Actions chamam `getCurrentUser()` mas não verificam se o `productId` pertence ao usuário.
**Impacto:** Usuários podem editar/anúncios alheios se RLS falhar.
**Por que:** Double-check necessário para error handling amigável.
**Solução:** Adicionar `requireOwnership`.
**Arquivos envolvidos:** `listing.actions.ts`, `listing.service.ts`.

### [P0] Image uploader UI pode estar sem progresso e sem validação robusta
**Arquivo:** `src/features/listings/components/image-uploader.tsx`
**Problema:** O componente de upload pode chamar `uploadChatImage`? Na verdade, os listings usam storage próprio; pode estar sem estados de erro amigáveis.
**Impacto:** UX de upload menos claro.
**Por que:** Necessário para visibilidade do progresso.
**Solução:** Adicionar estado de progresso e mensagens de erro amigáveis.
**Arquivos envolvidos:** `image-uploader.tsx`.

## Solução proposta
1. Adicionar verificação de propriedade em actions.
2. Melhorar UI de upload.

## Arquivos envolvidos
- Modificar: `src/features/listings/services/listing.actions.ts`
- Modificar: `src/features/listings/components/image-uploader.tsx`

## Plano de implementação
1. Adicionar helper `requireOwnership` em `auth/session.service.ts`.
2. Atualizar cada Server Action para checar propriedade.
3. Adicionar UI de progresso de upload.

## Componentização
- Hook `useUploadProgress`? não necessário agora.

## Performance
- Não há impacto.

## Acessibilidade
- Certificar-se de que botões de upload têm aria.

## Segurança
- Conforme.

## Supabase
- RLS existente.

## Testes
- Adicionar teste para propriedade.

## Critérios de aceite
- [ ] Usuário não proprietário recebe erro.
- [ ] Progresso de upload visível.

## Riscos
- Não há.

## Dependências
- Phase 01.

## Ordem de implementação
1. Criar `requireOwnership`.
2. Atualizar actions.
3. Melhorar upload.

---

# Phase 04 — Favoritos

## Objetivo
Permitir favoritar/desfavoritar produtos, listar favoritos.

## Contexto atual
Módulo `features/favorites/` com serviços `favorites.service.ts`, `favorites.actions.ts` e componentes (`favorite-button`, `favorites-page`, `favorite-empty-state`).

## Problemas encontrados

### [P0] `favorite-button.tsx` sem estado otimista
**Arquivo:** `src/features/favorites/components/favorite-button.tsx`
**Problema:** Ao favoritar/desfavoritar, o UI pode travar sem feedback visual.
**Impacto:** UX ruim.
**Por que:** Sem otimismo.
**Solução:** Adicionar otimismo.
**Arquivos envolvidos:** `favorite-button.tsx`.

### [P0] `favorites.service.ts` `getFavoriteProductIds` sem cache
**Arquivo:** `src/features/favorites/services/favorites.service.ts`
**Problema:** Cada chamada aciona uma query RPC com filtro por `seller_id`.
**Impacto:** Taxa extra.
**Por que:** Chamado em cada página.
**Solução:** Adicionar `cache`.
**Arquivos envolvidos:** `favorites.service.ts`.

## Solução proposta
1. Adicionar otimismo.
2. Adicionar cache.

## Arquivos envolvidos
- Modificar: `src/features/favorites/components/favorite-button.tsx`
- Modificar: `src/features/favorites/services/favorites.service.ts`

## Plano de implementação
1. Adicionar otimismo.
2. Adicionar `cache()` em `getFavoriteProductIds`.

## Testes
- Testes existentes de favoritas (3 arquivos).

## Critérios de aceite
- [ ] Estado otimista presente.
- [ ] Sem query duplicada.

---

# Phase 05 — Chat

## Objetivo
Conversa entre usuário e vendedor sobre produto.

## Contexto atual
Módulo `features/chat/` com serviços `chat.service.ts`, `chat-storage.service.ts`, `chat.actions.ts`, hook `use-chat-realtime.ts`, components (`chat-window`, `message-list`, `message-composer`, `conversation-list`).

## Problemas encontrados

### [P0] Signed URL não verifica participação
**Arquivo:** `src/features/chat/services/chat-storage.service.ts`
**Problema:** `getChatImageUrl` assina qualquer caminho.
**Impacto:** Vazamento.
**Solução:** Adicionar verificação via `check_conversation_participant`.

### [P0] Hook `use-chat-realtime.ts` pode não filtrar corretamente
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Canais de realtime não filtrados por conversa/usuário.
**Impacto:** Ruído.
**Solução:** Filtrar.

### [P0] Erros de realtime sem retry
**Arquivo:** `src/features/chat/hooks/use-chat-realtime.ts`
**Problema:** Sem reconexão.
**Solução:** Adicionar retry.

## Solução proposta
1. Adicionar verificação de participação para URLs assinadas.
2. Filtrar canais de realtime.
3. Adicionar retry.

## Arquivos envolvidos
- Modificar: `chat-storage.service.ts`
- Modificar: `chat.actions.ts` (adicionar verificação)
- Modificar: `use-chat-realtime.ts`

## Testes
- Adicionar testes para chat storage, realtime.

## Critérios de aceite
- [ ] URLs assinadas verificam participação.
- [ ] Canais filtrados.
- [ ] Retry de conexão.

---

# Phase 06 — Dashboard

## Objetivo
Visão geral de listings, métricas, mensagens recentes.

## Contexto atual
Módulo `features/dashboard/` com serviços `dashboard.service.ts`, componentes (`seller-dashboard`, `dashboard-metrics`, `dashboard-listings`, `dashboard-resource-cards`, `dashboard-status-button`, `dashboard-trust-card`).

## Problemas encontrados

### [P0] `dashboard.service.ts` não testa produtos críticos
**Arquivo:** `src/features/dashboard/services/dashboard.service.ts`
**Problema:** Service pode ter falhas silenciosas.
**Impacto:** Risco.
**Solução:** Adicionar testes unitários.
**Arquivos envolvidos:** `dashboard.service.ts`.

### [P0] Componentes podem estar excessivamente grandes
**Arquivo:** `src/features/dashboard/components/seller-dashboard.tsx` (verificar tamanho)
**Problema:** Componente grande > 200 lines.
**Impacto:** Manutenibilidade.
**Solução:** Extrair subcomponentes.

## Solução proposta
1. Adicionar testes para service.
2. Extrair componentes.

## Testes
- Adicionar testes.

## Critérios de aceite
- [ ] Cobertura de testes.

---

# Phase 07 — Perfil

## Objetivo
Gerenciar perfil próprio e visualizar perfil público.

## Contexto atual
Módulo `features/profile/` com serviços `profile.service.ts`, `profile.actions.ts`, `profile-storage.service.ts`, componentes (`profile-page`, `profile-form`, `profile-avatar`, `public-profile-page`).

## Problemas encontrados

### [P2] Lint warnings de variáveis não utilizadas
**Arquivo:** `src/features/profile/components/profile-avatar.tsx` (variável error não utilizada), `src/features/profile/services/profile.actions.ts` (error), `src/features/profile/services/profile.service.ts` (mapAuthError não utilizada)
**Problema:** Code smell.
**Solução:** Remover imports não utilizadas.
**Arquivos envolvidos:** Modificar três arquivos.

## Solução proposta
1. Remover imports não utilizadas.

## Arquivos envolvidos
- Modificar: `src/features/profile/components/profile-avatar.tsx`
- Modificar: `src/features/profile/services/profile.actions.ts`
- Modificar: `src/features/profile/services/profile.service.ts`

## Testes
- Testes existentes: `profile.schemas.test.ts`

## Critérios de aceite
- [ ] Sem lint warnings.

---

# Phase 08 — Landing

## Objetivo
Página de marketing inicial.

## Contexto atual
Módulo `features/landing/`.

## Problemas encontrados

### [P3] Conteúdo pode divergir do copy de produto
**Arquivo:** `src/features/landing/components/*`.
**Solução:** Revisar copy.

### [P3] Teste de landing page ausente para seções
**Arquivo:** Apenas 1 arquivo de teste.
**Solução:** Adicionar testes de componentes.

## Solução proposta
1. Revisar copy.
2. Adicionar testes.

---

# Phase 09 — Legal

## Objetivo
Páginas legais.

## Contexto atual
`features/legal/components/legal-placeholder-page.tsx`

## Problemas encontrados

### [P3] Conteúdo legal placeholder
**Arquivo:** `src/features/legal/components/legal-placeholder-page.tsx`
**Solução:** Substituir por conteúdo final.

## Solução proposta
1. Substituir.
2. Adicionar testes.

---

Continuar com documentos transversais.
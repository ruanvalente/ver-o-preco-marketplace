# Phase 20 — Roadmap

## Objetivo
Planejar implementação incremental das melhorias identificadas.

## Dependências

### Matrix de Dependências

| Fase | Depende de | Bloqueia | Pode ser executada paralelamente |
|------|------------|---------|------------------------|
| 01 Auth | Foundation | 02 Products | 05 Chat, 04 Favorites |
| 02 Products | 01 Auth | 03 Listings | 04 Favorites |
| 03 Listings | 01 Auth | 04 Favorites, 05 Chat | 02 Products |
| 04 Favorites | 01 Auth | 05 Chat | 02 Products, 03 Listings |
| 05 Chat | 01 Auth, 03 Listings | 06 Dashboard | 02 Products |
| 06 Dashboard | 01 Auth | - | 04 Favorites, 07 Profile |
| 07 Profile | 01 Auth | - | - |
| 08 Landing/Legal | - | - | - |
| 09 Performance | - | - | - |
| 10 Accessibility | - | - | - |
| 11 Security | 01 Auth | - | 09 Performance |
| 12 Supabase | 01 Auth | - | 13 Testing |
| 13 Testing | - | - | 14 Code Quality |
| 14 Code Quality | - | - | 15 TypeScript |
| 15 TypeScript | - | - | 16 React |
| 16 React | - | - | 17 Next.js |
| 17 Next.js | - | - | 18 Tailwind/UI |
| 18 Tailwind/UI | - | - | 19 Architecture |
| 19 Architecture | - | - | 20 Roadmap |

### Prioridade Matriz (P0–P3)

| Prioridade | Problema | Feature | Impacto | Esforço |
|-----------|---------|---------|--------|--------|
| P0 | Verificar participação para URLs assinadas do chat | Chat | Crítico | M |
| P0 | Adicionar verificação de propriedade em Server Actions | Todas | Crítico | M |
| P1 | Adicionar cache para getFavoriteProductIds | Favorites | Alto | S |
| P1 | Adicionar testes de chat storage | Chat | Alto | M |
| P1 | Otimizar getSellerChatMetrics | Chat | Alto | S |
| P1 | Adicionar índice composto para products | Products | Alto | S |
| P2 | Adicionar otimismo para favoritos | Favorites | Médio | S |
| P2 | Extrair componentes grandes | Dashboard | Médio | M |
| P2 | Adicionar `aria-live` no chat | Chat | Médio | S |
| P2 | Garantir focus ring em selects | Products | Médio | S |
| P3 | Revisar design system | UI | Baixo | M |
| P3 | Adicionar Playwright E2E | Todas | Baixo | L |

### Ordem recomendada de implementação (faseada)

#### Fase 01 – Security Hardening
- Criar RPC `check_conversation_participant`
- Adicionar `requireOwnership` em todas as Server Actions
- Adicionar políticas de bucket de storage (`migrations/0010.sql`)

#### Fase 02 – Produtos e Favoritos
- Adicionar cache em `getFavoriteProductIds`
- Adicionar otimismo no botão de favoritos

#### Fase 03 – Chat
- Adicionar verificação de participação para URLs assinadas
- Filtrar canais de realtime
- Adicionar retry
- Otimizar `getSellerChatMetrics` com RPC
- Adicionar testes de storage e realtime

#### Fase 04 – Dashboard
- Adicionar testes unitários para `dashboard.service.ts`
- Extrair `seller-dashboard.tsx`

#### Fase 05 – Perfil
- Remover imports não utilizadas

#### Fase 06 – Performance
- Instrumentar observabilidade
- Invalidar cache de catálogo em mutações de listings
- Ajustar `priority` de imagens

#### Fase 07 – Acessibilidade
- Adicionar `aria-live` no chat
- Garantir focus ring
- Testar focus trap em sheet

#### Fase 08 – Qualidade de Código
- Extrair componentes grandes
- Definir tipos de row (remover casts)

#### Fase 09 – TypeScript
- Definir tipos de row
- Substituir `!` por optional chaining

#### Fase 10 – React
- Estabilizar dependências em `useFocusFirstError`
- Adicionar cleanup em `useChatRealtime`

#### Fase 11 – Next.js
- Adicionar metadata em rotas dinâmicas
- Atualizar matcher de proxy

#### Fase 12 – Tailwind/UI
- Extrair componente `Select`
- Usar `@apply` onde apropriado

#### Fase 13 – Arquitetura
- Revisar DESIGN.md
- Adicionar mappers onde necessário

#### Fase 14 – Roadmap (este)
- Documentar dependências e prioridades.

### Próximos passos
1. Iniciar Fase 01 (Security Hardening) com migrações e actions.
2. Executar testes após cada fase.
3. Revisar testes de lint e typecheck após cada fase.
4. Publicar mudanças a cada metade de semana.

---

**Próximos passos:**
- `bun run typecheck` após alterações.
- `bun run lint` após alterações.
- `bun run test` após alterações.
- Executar `bun run build` para verificar.

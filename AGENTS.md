<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Ver-o-Preço Marketplace

Regras operacionais para agentes de IA. **Este arquivo é um índice**, não uma especificação de produto.

## Fontes de verdade

| Tema | Fonte |
| --- | --- |
| Produto, escopo, voz, decisões de negócio | `PRODUCT.md` |
| Visual, tokens, tipografia, componentes | `DESIGN.md` (prevalece) + `docs/design/` |
| Arquitetura e limites de módulo | `docs/architecture/` |
| Decisões registradas | `docs/adr/` |
| Políticas de IA (MCP, secrets, comandos) | `docs/ai/security.md` |
| Gates de fluxo do agente | `docs/ai/workflow.md` |
| Catálogo de skills/agentes | `docs/ai/README.md` |
| Planos de implementação | `docs/plans/` |
| Issues | GitHub Issues via `gh` (`docs/agents/issue-tracker.md`) |

Se duas fontes conflitarem, use a ordem: intenção explícita do usuário → segurança → `DESIGN.md` (visual) / `PRODUCT.md` (produto) → arquivo específico → este arquivo.

---

## 1. Ferramentas e comandos

- Use **bun** para instalar e executar scripts (`bun add`, `bunx`, `bun run ...`).
- Stack atual: Next.js 16.4.6 (App Router), React 19.3, TypeScript strict, Tailwind CSS v4 (CSS-first), primitivas compatíveis com shadcn/ui em `src/components/ui/`, Supabase (`@supabase/ssr`).
- **Antes de escrever código Next.js**, leia o guia correspondente em `node_modules/next/dist/docs/`.
- Quality gates obrigatórios antes de declarar trabalho concluído:
  `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.
- Testes: Vitest + Testing Library. Não adicionar Playwright/Cypress sem aprovação explícita.
- Não há formatter configurado: siga o estilo existente do arquivo. Não introduza Prettier/Biome sem aprovação.

---

## 2. Arquitetura e limites

- Organização **feature-first** em `src/features/`. Módulos atuais: `auth`, `products`, `listings`, `favorites`, `chat`, `profile`, `dashboard`, `landing`, `legal`.
- Código específico de feature fica dentro da feature. Somente código genuinamente compartilhado vai para `src/components/`, `src/lib/`, `src/hooks/` ou `src/types/`.
- Componentes de domínio **nunca** em `src/components/ui/` (ex.: `product-card` pertence a `features/products/`).
- Prefira Server Components. Use Client Components apenas para interatividade, APIs do navegador, estado local ou Realtime.
- Acesso ao Supabase fica isolado em `src/lib/supabase/` e em `features/<feature>/services/`. Componentes não contêm queries longas.
- Estado de busca/filtros em parâmetros de URL (URLs compartilháveis, SSR, SEO).
- Não crie diretórios vazios, abstrações prematuras nem duplique regras de negócio entre UI e serviços.

---

## 3. Segurança e dados — regras duras

- Supabase é a única fonte de autenticação e dados. **RLS é obrigatório**; autorização nunca depende de estado no cliente.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY`. Variáveis `NEXT_PUBLIC_*` são públicas por definição.
- Nunca faça commit de segredos. `.env.example` é o template versionado; `.env.local` é local e ignorado. Não imprima seu conteúdo, nem tokens/JWTs, em logs ou respostas.
- **Toda mudança de schema passa por `migrations/NNNN_*.sql`.** Nunca use `execute_sql` ou `apply_migration` via MCP em produção, nem como substituto de migration versionada.
- O MCP do Supabase neste projeto é **project-scoped e somente leitura** por padrão (`opencode.json`). Qualquer escrita, mudança de URL/config do MCP ou conexão com outro projeto exige confirmação do usuário. Política completa: `docs/ai/security.md`.
- Nunca execute sem confirmação explícita: `git push`, `git push --force`, `git reset --hard`, `git clean -fd`, `DROP`/`TRUNCATE`, deploy, criação de projeto ou qualquer ação em produção.
- Preserve alterações do usuário; nunca reescreva histórico do Git sem pedido.

---

## 4. UI, acessibilidade e performance

- `DESIGN.md` é a fonte de verdade visual. Tokens reais vivem em `src/app/theme.css` — não infera primary/secondary; consulte o arquivo.
- Mobile-first de verdade: sem overflow horizontal, touch targets ~44×44px, layout responsivo em mobile/tablet/desktop.
- WCAG 2.2 AA: HTML semântico, foco visível, labels, erros acessíveis, contraste, `prefers-reduced-motion`.
- Todo feature precisa definir estados de **loading, empty, error, unauthorized e forbidden**, com mensagens humanas — nunca erros crus do Supabase.
- Imagens otimizadas, paginação/limites de query, Realtime apenas onde há necessidade (chat).
- Identidade regional sutil (Pará/açaí) em cor, naming e microcopy — sem caricatura. Não copie identidade visual, layout ou UX de OLX/Mercado Livre.

---

## 5. Fluxo do agente

Siga os gates em `docs/ai/workflow.md`. Resumo:

1. **Context** — leia as fontes de verdade e os arquivos existentes antes de planejar.
2. **Analysis** — identifique módulo, convenções e abstrações reutilizáveis.
3. **Planning** — feature nova ou mudança não trivial → plano em `docs/plans/`. Mudança de schema → migration + skill `supabase-postgres-best-practices`. **Pare e pergunte** se houver secrets, MCP write, push, deploy ou produção.
4. **Implementation** — mudanças pequenas, focadas, sem arquivos não relacionados.
5. **Tests** — escreva/atualize testes com Vitest seguindo convenções existentes.
6. **Code Review** — use os agentes `architect`, `reviewer` e `security-reviewer` quando fizer sentido.
7. **Validation** — execute os quatro quality gates.
8. **Documentation** — atualize docs afetados e verifique drift (skill `documentation-and-adrs`).

**Definition of Done:** requisito implementado no módulo correto · responsivo · estados completos · validação client+server · RLS/Storage revisados · acessibilidade revisada · testes · typecheck/lint/test/build passando · segurança revisada · docs atualizados.

---

## 6. Skills e agentes

- Catálogo e gatilhos em `docs/ai/README.md`. Carregue skills por necessidade explícita, não o catálogo inteiro.
- Agentes read-only do projeto em `.opencode/agents/`.
- Para revisão de UI, use `impeccable` (build/audit visual) ou `web-design-guidelines` (checagem de guidelines), não ambos por padrão.
- Para deploy, `deploy-to-vercel` (fluxo interativo) ou `vercel-cli-with-tokens` (CI/token). Nunca exponha tokens de deploy.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues; use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Architecture decisions are recorded in `docs/adr/`. See `docs/agents/domain.md`.

# Configuração de IA do Projeto

Catálogo enxuto das ferramentas de IA versionadas neste repositório. Regras de uso: [`AGENTS.md`](../../AGENTS.md) · segurança: [`security.md`](security.md) · fluxo: [`workflow.md`](workflow.md).

## MCP

| Servidor | Escopo | Modo | Uso |
| --- | --- | --- | --- |
| `supabase` | projeto (`opencode.json`) | somente leitura, `database,docs,debugging` | inspecionar schema, consultar dados, consultar docs e logs |

Autenticação é feita pelo usuário via `/mcps`. Escrita, mudança de URL ou conexão com outro projeto exigem confirmação — ver `security.md`.

## Skills instaladas

Carregar sob demanda. Não carregar todas de uma vez.

| Skill | Gatilho |
| --- | --- |
| `supabase` | integração, Auth, Storage, Realtime, MCP Supabase (atenção: `security.md` prevalece sobre sugestões de `.mcp.json`/`execute_sql`) |
| `supabase-postgres-best-practices` | **antes** de qualquer migração, DDL, RLS, índice, trigger, function ou query SQL no Supabase |
| `documentation-and-adrs` | documentar decisão, escrever/atualizar ADR, checar drift de docs |
| `tdd` | implementar ou corrigir com testes primeiro |
| `impeccable` | construir, auditar ou polir interface (visual, layout, tipografia, estados) |
| `web-design-guidelines` | checagem pontual de acessibilidade e guidelines de UI — não usar junto com `impeccable` por padrão |
| `vercel-react-best-practices` | escrever/revisar código React/Next.js com foco em performance |
| `vercel-composition-patterns` | compor componentes, evitar proliferação de props booleanas, compound components |
| `vercel-optimize` | custo/performance em projeto Vercel já deployado, com métricas verificadas |
| `deploy-to-vercel` | deploy interativo quando o usuário pedir para publicar |
| `vercel-cli-with-tokens` | operações Vercel via token em CI — nunca expor o token |
| `writing-guidelines` | revisar prosa e documentação |
| `create-github-action-workflow-specification` | especificar workflow de GitHub Actions existente |

## Agentes do projeto

Read-only, em `.opencode/agents/`. Herdam o modelo da sessão.

| Agente | Uso |
| --- | --- |
| `architect` | analisar limites de módulo, feature-first, modelo de dados, Server vs Client; entrega estado → problemas → opções → recomendação |
| `reviewer` | revisar diff com foco em RLS, privacidade, validação, estados de UI, acessibilidade e migrations; findings P0–P3 |
| `security-reviewer` | auditar secrets, RLS/Storage, posse de dados, uploads, prompt injection e comandos destrutivos |

Para acionar: pedir ao agente principal, por exemplo, *“use o agente `security-reviewer` para revisar este diff”*.

## Comandos

| Comando | Uso |
| --- | --- |
| `/pull-request` | preparar branch e PR a partir de `develop`, com título e descrição em inglês; push e criação do PR exigem confirmação |

## Fontes de verdade

- Produto e escopo: `PRODUCT.md`
- Visual: `DESIGN.md` + `docs/design/`
- Arquitetura: `docs/architecture/`
- Decisões: `docs/adr/`
- Planos: `docs/plans/`
- Issues: GitHub Issues via `gh` (`docs/agents/issue-tracker.md`)

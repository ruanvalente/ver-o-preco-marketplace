# Fluxo de Trabalho para Agentes de IA

Sequência padrão de gates para qualquer tarefa não trivial neste repositório. Tarefas pequenas e óbvias podem compactar gates, mas não pular Context, Segurança e Validação. Política de segurança: [`security.md`](security.md).

## Gates de aprovação do usuário

Válidos para **toda** feature ou correção de bug. Estes gates não podem ser compactados:

1. **Análise** — investigar código, docs e issues; carregar as skills necessárias. Não criar branch nem tocar em arquivos de implementação.
2. **Proposta** — apresentar solução, arquivos afetados, riscos e critérios de aceite. Parar e aguardar autorização explícita do usuário.
3. **Bug primeiro** — se for bug fix (regressão ou comportamento incorreto), criar a issue no GitHub **em inglês**, com título e corpo alinhados à análise, antes de qualquer branch ou código. O título começa com um prefixo em maiúsculas que identifica o tipo de trabalho, seguido de dois-pontos e de um resumo curto (ver [Prefixos de títulos de issues](#prefixos-de-títulos-de-issues)). A issue também passa pela revisão do usuário. Melhorias de auditoria não exigem nova issue: usa-se a issue existente.
4. **Branch e implementação** — após a autorização, criar branch a partir de `develop` com nome condizente (`fix/issue-<n>-<slug>` ou `feat/issue-<n>-<slug>`) e implementar somente o escopo aprovado.
5. **Revisão da implementação** — ao concluir, incluindo os gates de *Validation* abaixo, devolver o trabalho ao usuário. Não commitar, fazer push nem abrir PR neste ponto.
6. **Commit, PR e fechamento** — somente após o feedback de aprovação da revisão: commit com mensagem **em inglês**, detalhada e objetiva; PR também em inglês; fechar a issue relacionada explicando o que foi entregue.
7. Push e deploy continuam exigindo confirmação explícita e separada (ver `security.md`).

Os gates abaixo complementam este fluxo: *Context* + *Analysis* correspondem ao passo 1, *Planning* ao passo 2, e *Implementation* a *Documentation* aos passos 4 e 5.

## Prefixos de títulos de issues

Todo título de issue começa com um prefixo em maiúsculas seguido de `:` e de um resumo em inglês. O prefixo identifica o tipo de trabalho entregue, não o estado da issue.

| Prefixo | Tipo de trabalho |
| --- | --- |
| `BUG` | Regressão ou comportamento incorreto |
| `FEAT` | Nova funcionalidade |
| `REFACTOR` | Mudança interna sem alteração de comportamento |
| `CI` | Pipeline, build ou automação |
| `DOC` | Documentação |
| `TEST` | Testes |

Exemplo: `BUG: Catalog search fails with ambiguous column reference in search RPCs`.

Os labels do GitHub (`bug`, `P1`, etc.) continuam sendo usados normalmente: o prefixo não os substitui. Os nomes das branches mantêm o padrão `fix/`, `feat/`, `docs/` etc. descrito no gate 4 — o prefixo do título não altera a convenção de branches. Títulos e corpos de issues e PRs permanecem em inglês.

## 1. Context

Obter fatos antes de planejar.

- Ler `AGENTS.md`, `PRODUCT.md` e `DESIGN.md` conforme a natureza da tarefa.
- Para código Next.js, ler o guia correspondente em `node_modules/next/dist/docs/`.
- Para mudança de schema, ler `migrations/` e `docs/architecture/supabase.md`.
- Usar as skills e MCPs disponíveis **sempre que a tarefa se beneficiar deles**: carregar apenas as skills relevantes (não o catálogo inteiro, ver [`README.md`](README.md)); consultar Context7 para dúvidas de bibliotecas/APIs e o MCP do Supabase dentro da política de permissões (`security.md`). Registrar no plano quais skills/MCPs foram usados — ou por que não foram necessários.
- Verificar `git status --short` para não sobrescrever trabalho do usuário.

**Saída:** entendimento do estado real, com caminhos de arquivo.

## 2. Analysis

- Identificar o módulo dono da mudança (`src/features/<feature>/`).
- Procurar abstrações e componentes existentes antes de criar novos.
- Identificar fronteira Server/Client Component e pontos de acesso ao Supabase.
- Listar estados de UI afetados: loading, empty, error, unauthorized, forbidden.

**Saída:** módulo, convenções reutilizáveis e riscos de segurança.

## 3. Planning

- Feature nova ou mudança não trivial → plano em `docs/plans/`.
- Mudança de schema → migration `migrations/NNNN_*.sql` + skill `supabase-postgres-best-practices`.
- Critérios de aceitação em formato BDD para fluxos críticos (autorização, chat, anúncios).
- **Parar e perguntar** se houver: segredos, escrita/configuração de MCP, push, deploy, produção, nova dependência/skill ou exclusão de arquivos do usuário.

Decisões estruturais duráveis viram ADR em `docs/adr/` (usar skill `documentation-and-adrs`).

**Saída:** plano pequeno, com escopo e não-escopo explícitos.

## 4. Implementation

- Mudanças incrementais, focadas, no módulo correto.
- Seguir o estilo existente do arquivo; não introduzir formatter sem aprovação.
- Não tocar em arquivos não relacionados, não criar diretórios vazios, não duplicar regras de negócio.
- Componentes de domínio ficam na feature, nunca em `src/components/ui/`.
- Nunca expor erro cru do Supabase; nunca confiar no cliente para autorização.

## 5. Tests

- Usar Vitest + Testing Library, seguindo as convenções existentes da feature.
- Preferir testes de comportamento do usuário, não detalhes de implementação.
- Cobrir fluxos críticos: autenticação, publicação/edição de anúncio, favoritos, chat e estados de erro/autorização.

## 6. Code Review

Usar os agentes read-only do projeto quando fizer sentido:

| Agente | Quando usar |
| --- | --- |
| `architect` | mudança de estrutura, limites de módulo, modelo de dados, Server vs Client |
| `reviewer` | revisão geral do diff: segurança, UX, acessibilidade, responsividade |
| `security-reviewer` | toque em RLS, Storage, secrets, uploads, MCP ou ações destrutivas |

Corrigir findings reais antes de avançar. Se o diff estiver correto, registrar isso — não inventar problemas.

## 7. Validation

Executar todos os gates e reportar resultados:

```sh
bun run typecheck
bun run lint
bun run test
bun run build
```

Se algum gate falhar, corrigir ou reportar o bloqueio. Não desabilitar lint/typecheck para "passar".

## 8. Documentation

- Atualizar docs afetados no mesmo trabalho (README, `docs/architecture/`, ADRs, planos).
- Verificar drift: quando o código mudou depois do doc, o doc está desatualizado.
- Preservar histórico de ADRs e changelogs: nunca reescrever entradas antigas.

## Definition of Done

- [ ] Requisito implementado no módulo correto
- [ ] Responsividade mobile-first verificada
- [ ] Estados de loading, empty, error, unauthorized e forbidden definidos
- [ ] Validação no cliente e no servidor
- [ ] RLS e Storage revisados quando aplicável
- [ ] Acessibilidade revisada (WCAG 2.2 AA)
- [ ] Testes escritos/atualizados
- [ ] typecheck, lint, test e build passando
- [ ] Segurança revisada conforme `security.md`
- [ ] Documentação atualizada
- [ ] Nenhum push, commit ou deploy automático

# Issue tracker: GitHub

Issues e specs deste repo ficam no GitHub Issues. Use o `gh` CLI para todas as operações.

## Convenções

- **Criar issue**: `gh issue create --title "..." --body "..."` (use heredoc para corpos com múltiplas linhas). Issue and PR titles and bodies must always be written in English — see `docs/ai/workflow.md` (user-approval gates). O título da issue começa com um prefixo de tipo (`BUG`, `FEAT`, `REFACTOR`, `CI`, `DOC`, `TEST`) seguido de `:` — convenção completa em `docs/ai/workflow.md#prefixos-de-títulos-de-issues`.
- **Ler issue**: `gh issue view <numero> --json number,title,body,labels,comments`.
- **Listar issues**: `gh issue list --state open --json number,title,labels --jq '.[] | {number, title, labels: [.labels[].name]}'`, com filtros `--label` e `--state` conforme necessário.
- **Sub-issue**: `gh issue create --parent <pai> ...` ou `gh issue edit <pai> --add-sub-issue <filha>` (`gh` 2.94+). Em versões antigas, use `gh api --method POST repos/<owner>/<repo>/issues/<pai>/sub_issues -F sub_issue_id=<id-do-banco-da-filha>`. Sem sub-issues, coloque `Part of #<pai>` no topo da issue filha.
- **Dependências (bloqueios)**: `gh issue create --blocked-by <n>,<n> ...` ou `gh issue edit <filha> --add-blocked-by <bloqueador>` (`gh` 2.94+). Em versões antigas: `gh api --method POST repos/<owner>/<repo>/issues/<filha>/dependencies/blocked_by -F issue_id=<id-do-banco-do-bloqueador>`, onde o id vem de `gh api repos/<owner>/<repo>/issues/<n> --jq .id` (não é o número da issue). Sem dependências nativas, registre `Blocked by: #<n>, #<n>` no topo da issue filha. Uma issue só está livre quando todos os bloqueadores estão fechados.
- **Contar bloqueadores abertos**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (0 = pode começar). `gh issue view <n> --json blockedBy` inclui fechados; filtre com `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comentar**: `gh issue comment <numero> --body "..."`.
- **Labels**: `gh issue edit <numero> --add-label "..."` / `--remove-label "..."`.
- **Criar label ausente**: só quando nenhuma label existente representar o trabalho e após aprovação explícita; use `gh label create "<nome>" --description "<descrição>" --color "<hex>"` e confirme com `gh label list`. Não crie labels redundantes ou "por precaução".
- **Authorship and sign-off**: get the GitHub login with `gh api user --jq '.login'`; use it with `--assignee` and as the only signature (`@login`) in issue bodies, PR bodies, comments and commit messages. Do not include a name or e-mail, and never invent a login.
- **Fechar**: publique a explicação com `gh issue comment <numero> --body "..."` e depois `gh issue close <numero>`.

O repo é inferido de `git remote -v`; `gh` resolve isso automaticamente dentro do clone.

Crie issues **apenas no repo do usuário**. Antes da primeira criação, confirme o destino com `gh repo view --json nameWithOwner`; nunca abra issues em repos de terceiros usados apenas como origem de ferramentas ou skills.

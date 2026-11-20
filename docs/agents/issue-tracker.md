# Issue tracker: GitHub

Issues e specs deste repo ficam no GitHub Issues. Use o `gh` CLI para todas as operações.

## Convenções

- **Criar issue**: `gh issue create --title "..." --body "..."` (use heredoc para corpos com múltiplas linhas). Issues de bug criadas pelo fluxo de aprovação devem ter título e corpo em inglês — ver `docs/ai/workflow.md` (gates de aprovação do usuário).
- **Ler issue**: `gh issue view <numero> --json number,title,body,labels,comments`.
- **Listar issues**: `gh issue list --state open --json number,title,labels --jq '.[] | {number, title, labels: [.labels[].name]}'`, com filtros `--label` e `--state` conforme necessário.
- **Sub-issue**: `gh issue create --parent <pai> ...` ou `gh issue edit <pai> --add-sub-issue <filha>` (`gh` 2.94+). Em versões antigas, use `gh api --method POST repos/<owner>/<repo>/issues/<pai>/sub_issues -F sub_issue_id=<id-do-banco-da-filha>`. Sem sub-issues, coloque `Part of #<pai>` no topo da issue filha.
- **Dependências (bloqueios)**: `gh issue create --blocked-by <n>,<n> ...` ou `gh issue edit <filha> --add-blocked-by <bloqueador>` (`gh` 2.94+). Em versões antigas: `gh api --method POST repos/<owner>/<repo>/issues/<filha>/dependencies/blocked_by -F issue_id=<id-do-banco-do-bloqueador>`, onde o id vem de `gh api repos/<owner>/<repo>/issues/<n> --jq .id` (não é o número da issue). Sem dependências nativas, registre `Blocked by: #<n>, #<n>` no topo da issue filha. Uma issue só está livre quando todos os bloqueadores estão fechados.
- **Contar bloqueadores abertos**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (0 = pode começar). `gh issue view <n> --json blockedBy` inclui fechados; filtre com `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comentar**: `gh issue comment <numero> --body "..."`.
- **Labels**: `gh issue edit <numero> --add-label "..."` / `--remove-label "..."`.
- **Fechar**: publique a explicação com `gh issue comment <numero> --body "..."` e depois `gh issue close <numero>`.

O repo é inferido de `git remote -v`; `gh` resolve isso automaticamente dentro do clone.

Crie issues **apenas no repo do usuário**. Antes da primeira criação, confirme o destino com `gh repo view --json nameWithOwner`; nunca abra issues em repos de terceiros usados apenas como origem de ferramentas ou skills.

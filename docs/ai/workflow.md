# Fluxo de Trabalho para Agentes de IA

Sequência padrão de gates para qualquer tarefa não trivial neste repositório. Tarefas pequenas e óbvias podem compactar gates, mas não pular Context, Segurança e Validação. Política de segurança: [`security.md`](security.md).

## 1. Context

Obter fatos antes de planejar.

- Ler `AGENTS.md`, `PRODUCT.md` e `DESIGN.md` conforme a natureza da tarefa.
- Para código Next.js, ler o guia correspondente em `node_modules/next/dist/docs/`.
- Para mudança de schema, ler `migrations/` e `docs/architecture/supabase.md`.
- Carregar skills **por necessidade explícita**, não o catálogo inteiro (ver [`README.md`](README.md)).
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

## 1. Objetivo

Mover a orquestração de atualização de avatar (upload → action → limpeza → URL pública) de `ProfileAvatar` para `profile-storage.service.ts`, sem alterar comportamento, props, markup, copy ou integração com Storage. Issue-pai #70, Fase 01 — Foundation & correctness.

## 2. Estado atual (diagnóstico)

`src/features/profile/components/profile-avatar.tsx:43-83` concentra quatro responsabilidades no `handleFileSelect`:

- `uploadAvatarClient(file, userId)` — validação de arquivo, sessão e upload (service existente).
- `updateAvatarAction(path)` — Server Action que persiste o caminho e revalida rotas.
- `removeObsoleteAvatarsClient(userId, path)` — limpeza dos avatares antigos.
- `import("@/lib/supabase/client").createClient()` + `getPublicUrl(path)` — URL pública construída diretamente no componente, uma dependência de infraestrutura na UI.

O tipo `ProfileAvatarUploadResult` já existe em `types/profile.types.ts` e não é usado. Ele foi convertido em union discriminado (`success: true` com `avatarPath`/`avatarUrl`/`cleanupError?` ou `success: false` com `error`), para que o componente não precise de assertions. O service já importa `@/lib/supabase/client` estaticamente; trocar o `import()` dinâmico do componente pelo client do service não muda inicialização nem comportamento.

## 3. Escopo aprovado

### Profile (dono da lógica)

- `src/features/profile/services/profile-storage.service.ts`: nova função `updateAvatarClient(file, userId)`, usando as funções já existentes sem modificá-las. Ordem obrigatória: upload → action → limpeza → URL pública. Em caso de falha da action, limpeza e URL não são executadas. Retorno tipado como `ProfileAvatarUploadResult` (union discriminado): sucesso traz `avatarPath`, `avatarUrl` e opcionalmente `cleanupError` para representar o sucesso parcial (avatar aplicado, arquivos antigos remanescentes); falha traz `error`.
- `src/features/profile/types/profile.types.ts`: apenas o campo opcional `cleanupError?`.
- As funções `uploadAvatarClient` e `removeObsoleteAvatarsClient` permanecem exportadas e inalteradas.

### Consumidor

- `ProfileAvatar` chama `updateAvatarClient` e faz apenas a fiação: estado local (`isUploading`, `currentAvatarUrl`), feedback via `sonner` e `onAvatarUpdate`. JSX, classes, `aria-*`, copy pt-BR, reset do `<input>` e a prop `onAvatarUpdate?: (avatarPath: string) => void` permanecem idênticos.

## 4. Não-objetivos

- Mudança de mensagens de toast, ordem da limpeza, semântica de sucesso parcial ou comportamento do input.
- Mudança de props públicas, markup, classes, `aria-*`, copy ou responsividade.
- Alteração nas funções de upload/limpeza, na Server Action, em schemas, RLS, policies de Storage, migrations ou dependências.
- Commit, push, PR, merge ou fechamento de issue sem revisão e aprovação explícitas.

## 5. Critérios de aceite (BDD)

- **Dado** um arquivo válido, **quando** o usuário troca o avatar, **então** upload, action e limpeza ocorrem nessa ordem, a URL pública é devolvida pelo service, a imagem é atualizada, `onAvatarUpdate` recebe o caminho e o toast de sucesso aparece.
- **Dado** uma falha no upload ou na action, **quando** o fluxo termina, **então** a mensagem humanizada correspondente aparece, sem limpeza, sem URL e sem callback.
- **Dado** uma falha apenas na limpeza, **quando** o fluxo termina, **então** o avatar é aplicado e o callback dispara, com o aviso de que arquivos antigos permaneceram.
- **Dado** o componente, **quando** seu código é inspecionado, **então** não há import de `@/lib/supabase/client` nem construção de URL pública nele.
- **Dado** a suíte existente, **quando** ela roda, **então** todos os testes de perfil e demais features continuam passando.

## 6. Seams de teste (TDD)

Seames confirmados com o usuário antes de escrever os testes:

1. `updateAvatarClient` em `profile-storage.service.test.ts`: client Supabase e `profile.actions` mockados; cobre sucesso, ordem das etapas, falha de upload, falha da action (sem limpeza), falha de limpeza (sucesso com aviso) e exceção inesperada. Não cobre Storage/Supabase reais — as verificações de sessão e autorização permanecem nas funções existentes.
2. `ProfileAvatar` em `profile-avatar.test.tsx`: service e `sonner` mockados; cobre os toasts, o estado da imagem, o callback e o reset do input. Não cobre o Storage real (seam 1).

Ciclo vermelho → verde em duas fatias: service → componente. Títulos de teste em inglês; copy da UI permanece pt-BR.

## 7. Skills e MCPs utilizados

- `tdd` — seams acordados e ciclo por fatia (red → green).
- Documentação local do Next.js 16.4.6 (`01-directives/use-server.md`) — confirmou que Server Functions definidas em arquivo com `use server` podem ser importadas por módulos consumidos em Client Components; a fronteira permanece no componente.
- Context7 — não necessário: a regra do repositório aponta a documentação local versionada como fonte para Next.js.
- MCP do Supabase — não utilizado: nenhuma mudança de schema, RLS, policy, dado ou config de projeto.
- `security-reviewer` — previsto na revisão por envolver upload/Storage.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, mais revisão com os agentes `architect`, `reviewer` e `security-reviewer`.

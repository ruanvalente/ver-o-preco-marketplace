## 1. Objetivo

Fechar os três itens da auditoria de acessibilidade da #25 (Phase 10 — WCAG 2.2 AA), corrigindo a forma como novas mensagens de chat são anunciadas e transformando os dois itens já resolvidos em garantias de regressão verificáveis. Issue-pai #70.

## 2. Estado atual (diagnóstico)

A auditoria (`docs/codebase-audit/10-accessibility.md`) foi escrita antes de implementações posteriores; o código atual diverge dela:

- **Chat — parcialmente resolvido, mas insuficiente.** `message-list.tsx:196` tem `aria-live="off"` **intencional** para evitar leitura dupla; `chat-window.tsx:140` renderiza um `<div className="sr-only" role="status" aria-live="polite">` e `use-chat-messages.ts:54-60` preenche esse status com `"Nova mensagem recebida."` via `setTimeout(0)`. Ou seja, existe anúncio, mas **genérico**: o leitor não ouve o conteúdo da mensagem. Decisão do usuário nesta issue: trocar esse mecanismo por `role="log"` com o conteúdo real, removendo o aviso genérico para não duplicar anúncios.
- **Focus ring dos selects — já resolvido.** `src/components/ui/select.tsx:14` (commit `380957e`) já contém `focus-visible:border-ring`, `focus-visible:ring-[3px]` e `focus-visible:ring-ring/50`; `product-filters-form.tsx` usa esse primitivo nos três combobox. Falta apenas um teste de regressão.
- **Focus trap do drawer — mecanismo já presente, não verificado.** `mobile-product-filters.tsx` usa `SheetContent`, que renderiza `SheetPrimitive.Content` do Radix (`radix-ui@1.8.1`, modal por padrão: `FocusScope` com `loop`/`trapped`, `hideOthers` e restauração de foco no gatilho). Esta versão do Radix **não** emite `aria-modal`; o isolamento para leitores de tela é feito por `aria-hidden` no conteúdo externo. Não existe teste que prove o ciclo de foco.

Não há mudança de dependência: `axe-core@4.14.0` existe apenas como dependência transitiva, sem wrapper configurado no Vitest. Adicionar `vitest-axe` exigiria aprovação e fica fora do escopo; a verificação será feita com React Testing Library sobre comportamentos observáveis (papéis ARIA, foco e atributos), sem mocks de Radix.

## 2.1. Ajustes aprovados após revisão

A revisão independente confirmou a direção, mas apontou dois problemas P2 que mudaram a implementação:

1. **Centramento do estado vazio:** com o placeholder virando `<li>` dentro da `<ol>`, `h-full` resolvia contra uma altura indefinida e o texto subia para o topo. A `<ol>` passou a ter `h-full`, preservando o centramento.
2. **`aria-busy` sozinho não silencia o histórico:** a paginação e, principalmente, o resync de até 30 mensagens no `SUBSCRIBED` do Realtime inserem nós no mesmo commit em que a região volta a `polite`, então o `log` poderia ler o histórico em lote. Solução aprovada pelo usuário: **canal explícito de histórico**. `use-chat-realtime.ts` passou a chamar `onHistoryMessage` no resync (INSERTs/UPDATEs ao vivo continuam em `onMessage`); `use-chat-messages.ts` mantém `announcedMessageIds` com apenas as mensagens recebidas ao vivo e `addHistoryMessage` mescla sem anunciar; `MessageList` aplica `aria-live="off"` nos `<li>` cujo id não está nesse conjunto. Assim paginação, resync e mensagens do próprio usuário ficam fora do anúncio — sem timers, heurísticas de data nem segunda região viva.

Os status de erro de conexão/carregamento de imagem (`role="status"`) permanecem: a decisão era remover **o aviso genérico de nova mensagem**, não todos os status da tela. O rótulo `Close` do botão de fechar do Sheet é pré-existente em `src/components/ui/sheet.tsx` e fica fora deste escopo.

Trade-offs registrados na revisão final:

- **`role="log"` na `<ol>`** substitui o papel implícito `list`/`listitem`. É ARIA válido e o `aria-live="off"` por item evita o problema prático; a perda é apenas a navegação por lista do leitor de tela.
- **Mensagens recebidas durante um período offline** chegam pelo resync e, junto com o histórico, ficam com `aria-live="off"` — o usuário vidente as vê, mas o leitor de tela não é avisado individualmente. Essa é a contrapartida deliberada de não ler até 30 mensagens em lote. Um resumo polite (`"5 mensagens novas"`) poderia ser avaliado em trabalho separado, sem reintroduzir o aviso duplo.

## 3. Escopo aprovado

- `src/features/chat/components/message-list.tsx`: substituir `aria-live="off"` por `role="log"`, `aria-live="polite"`, `aria-relevant="additions"` e `aria-busy={isLoadingMore}` na `<ol>` que já tem `aria-label="Mensagens da conversa"`, agora com `h-full`. O estado vazio virou `<li>` para manter a região sempre montada. Cada `<li>` recebe `aria-live="off"` quando seu id não está em `announcedMessageIds`.
- `src/features/chat/components/chat-window.tsx`: remover o `<div role="status" aria-live="polite">` com o aviso genérico e a leitura de `announcement` do hook; passar `announcedMessageIds` para a lista e `addHistoryMessage` para o Realtime. Os status de erro pré-existentes permanecem.
- `src/features/chat/hooks/use-chat-messages.ts`: remover o estado `announcement`, o `window.setTimeout` em `addMessage` e o campo `announcement` do retorno; adicionar `announcedMessageIds` e `addHistoryMessage`, com o merge extraído para `mergeMessage` (usado pelos dois caminhos). Recibo de leitura e paginação permanecem idênticos.
- `src/features/chat/hooks/use-chat-realtime.ts`: nova opção `onHistoryMessage`, usada apenas por `loadRecentMessages` no `SUBSCRIBED`. Nenhuma mudança em parse, mapeamento, storage, presença, typing ou backoff.
- `src/features/products/tests/product-filters-form.test.tsx`: acrescentar teste de regressão afirmando que os três combobox mantêm as classes de `focus-visible` do primitivo compartilhado.
- `src/features/products/tests/mobile-product-filters.test.tsx` (novo): abrir o drawer, afirmar foco movido para dentro do diálogo, `Tab` no último elemento focável retornando ao primeiro, fechar com `Escape` (teclado) e afirmar que o foco volta para o botão "Filtros".
- Testes de chat atualizados: `use-chat-messages.test.ts` perde os dois testes do aviso genérico e cobre `announcedMessageIds`/`addHistoryMessage`; `use-chat-realtime.test.ts` cobre o roteamento do resync para `onHistoryMessage`; `chat-window.test.tsx` perde o campo `announcement` do mock e passa a afirmar a região `log` com o conteúdo da mensagem e os dois callbacks do Realtime.

## 4. Não-objetivos

- Não instalar `vitest-axe`, Playwright, Cypress ou qualquer dependência nova.
- Não alterar `src/components/ui/select.tsx`, `src/components/ui/sheet.tsx` nem `mobile-product-filters.tsx`: os mecanismos já existem, só faltava verificação.
- Não modificar Server Actions, serialização/mapeamento de mensagens do Realtime, estilos, tokens, layout, copy de UI pt-BR, schema/RLS/Storage/migrations nem variáveis de ambiente. A única mudança em `use-chat-realtime.ts` é o callback usado no resync, aprovada após a revisão.
- Não duplicar regiões vivas (manter `aria-live="off"` em `message-list` **e** o `role="status"` seria o resultado indesejado).
- Commit, push, PR, merge ou fechamento da issue somente após revisão e aprovação explícitas.

## 5. Critérios de aceite (BDD)

- **Dado** um chat com mensagens, **quando** a lista é renderizada, **então** ela expõe `role="log"`, `aria-live="polite"`, `aria-relevant="additions"` e contém o texto das mensagens; não existe mais `role="status"` com `"Nova mensagem recebida."`.
- **Dado** o carregamento de mensagens antigas, **quando** `isLoadingMore` é `true`, **então** a região `log` marca `aria-busy="true"` e volta a `false` ao terminar.
- **Dado** um novo evento Realtime de outra pessoa, **quando** `addMessage` é chamado, **então** a mensagem entra na lista com seu texto anunciado pelo `log`, sem estado de anúncio separado e sem timer.
- **Dados** histórico paginado, resync do Realtime ou mensagem do próprio usuário, **quando** entram na lista, **então** seu `<li>` tem `aria-live="off"` e nada é anunciado.
- **Dado** um chat sem mensagens, **quando** a lista é renderizada, **então** a região `log` continua montada e o texto de estado vazio permanece verticalmente centrado (`h-full`).
- **Dado** o formulário de filtros, **quando** os combobox são renderizados, **então** todos mantêm `focus-visible:ring-[3px]` e `focus-visible:ring-ring/50`.
- **Dado** o drawer de filtros, **quando** é aberto, **então** o foco entra no diálogo modal; ao pressionar `Escape`, **então** ele fecha e o foco retorna ao botão "Filtros".
- **Dado** a suíte existente, **quando** ela roda, **então** todos os testes de chat e products continuam passando.

## 6. Seams de teste (TDD)

1. `src/features/chat/tests/message-list.test.tsx` (novo): renderizar `MessageList` com mensagem de outra pessoa; afirmar `getByRole("log", { name: "Mensagens da conversa" })`, seus atributos, `h-full` e o conteúdo textual; afirmar `aria-busy` nos dois estados e `aria-live="off"` no `<li>` de histórico. Sem mocks — o componente é puro.
2. `src/features/chat/tests/chat-window.test.tsx`: com o hook mockado (padrão já existente na feature), afirmar ausência do status genérico, presença da região `log`, o `aria-live` por mensagem e os callbacks `onMessage`/`onHistoryMessage`; remover `announcement` do mock e usar `senderId` do participante no fixture "incoming".
3. `src/features/chat/tests/use-chat-messages.test.ts`: remover os testes do estado `announcement`; manter merge/ordenação/recibo/paginação e cobrir `announcedMessageIds`/`addHistoryMessage`.
4. `src/features/chat/tests/use-chat-realtime.test.ts`: com os mocks de Supabase existentes, afirmar que o `SUBSCRIBED` entrega as mensagens do resync a `onHistoryMessage` e nunca a `onMessage`.
5. `src/features/products/tests/product-filters-form.test.tsx`: estender o teste existente dos combobox com as classes de foco.
6. `src/features/products/tests/mobile-product-filters.test.tsx` (novo): usar `fireEvent` da React Testing Library; sem mock de Radix. O jsdom permite afirmar o `loop` do `FocusScope` (Tab no último elemento focável retorna ao primeiro), além da abertura, foco inicial, `Escape` e restauração de foco.

Ciclo vermelho → verde, fatia por fatia, começando pelo teste da lista de mensagens. Títulos de teste em inglês; copy da UI permanece pt-BR.

## 7. Skills e MCPs utilizados

- `accessibility-compliance` — carregada para orientar live regions, foco e padrões ARIA.
- `tdd` — cada fatia começou com teste vermelho; o canal de histórico e os ajustes pós-revisão seguiram o mesmo ciclo.
- Context7 — não necessário: o trabalho é código local e os comportamentos do Radix são verificados por teste, não por dúvida de API.
- MCP do Supabase — não utilizado: nenhuma mudança de schema, RLS, policy, dado ou config de projeto.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, mais revisão com os agentes `architect`, `reviewer` e `security-reviewer` (este último apenas para confirmar que nenhuma superfície de dados/autenticação foi tocada).

## 1. Objetivo

Atender ao critério P1 pendente da issue #24 (Phase 09 — Performance): instrumentar LCP, INP, CLS, TTFB e FCP, possibilitando medir e validar melhorias. Documentar que a invalidação do cache de catálogo já foi entregue anteriormente.

## 2. Estado atual (diagnóstico)

- **Medições: ausente.** Não há `useReportWebVitals`, `instrumentation-client.ts`, `@vercel/speed-insights` nem Lighthouse CI no repositório.
- **Cache de catálogo: atendido.** `listing.actions.ts` chama `updateTag(PRODUCTS_LIST_TAG)` em `revalidateListingViews`, e `products.service.ts` usa `cacheTag(PRODUCTS_LIST_TAG)` nas consultas. Há testes em `listing-actions.test.ts` e `products-service.test.ts` que cobrem o tag `products:list`. A sugestão da auditoria de usar `revalidateTag("products:list")` foi resolvida com `updateTag`, equivalente para cache components no App Router.
- **`priority` em listas: P2**, fora do escopo desta entrega.
- **Guia da versão instalada:** Next 16.4.6 não expõe módulo `next/speed`. A documentação local (`01-app/03-api-reference/04-functions/use-report-web-vitals.md`) recomenda `useReportWebVitals` (de `next/web-vitals`) em Client Component montado no layout raiz, ou o serviço gerenciado da Vercel. Context7 (/vercel/next.js v16.4.5) confirma a API e os nomes TTFB/FCP/LCP/INP/CLS.

## 3. Escopo (opção recomendada: sem novas dependências)

- `src/components/performance/web-vitals.tsx`: Client Component que registra `useReportWebVitals` com callback estável e não renderiza nada.
- `src/components/performance/report-web-vital.ts`: reporter puro e testável. Em desenvolvimento, registra a métrica via `console.info`; em produção, envia via `navigator.sendBeacon` para `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` quando configurado. Sem endpoint em produção: no-op silencioso.
- Sanitização da URL da navegação: apenas `pathname`, sem query/hash, com UUIDs mascarados como `:id` (evita vazar IDs de anúncios/conversas e dados pessoais).
- Montagem de `<WebVitals />` no `src/app/layout.tsx`.
- Documentação de `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` em `.env.example`.
- Testes Vitest do reporter (dev, produção com/sem endpoint, URL malformada, falha do beacon) e do componente (registro único do callback).

## 4. Não-objetivos

- Não adicionar `@vercel/speed-insights`, Lighthouse CI, Playwright ou qualquer dependência/workflow novo sem aprovação explícita.
- Não criar `instrumentation.ts` nem `instrumentation-client.ts`: não são necessários para Web Vitals nesta versão (o hook precisa estar em Client Component) e virariam código morto.
- Não alterar `products.service.ts`, `listing.actions.ts`, RLS, Storage ou UI de produto.
- Não configurar endpoint de coleta, deploy, commit, push, PR ou fechamento da issue sem aprovação.

## 5. Decisões

1. **Hook em Client Component isolado:** mantém o boundary `"use client"` restrito ao componente de medição, conforme o guia do Next 16.
2. **Callback estável em escopo de módulo:** o hook dispara novamente quando a referência muda; uma função de módulo evita duplicidade de relatórios.
3. **Transporte opcional:** `sendBeacon` é fire-and-forget, não bloqueia navegação nem hidratação. O payload é enviado como string JSON (`text/plain;charset=UTF-8`, CORS-safelisted), evitando preflight em coletores cross-origin. A variável é `NEXT_PUBLIC_*` (pública, sem segredo) e o endpoint é escolhido pelo time.
4. **Privacidade primeiro:** query strings e UUIDs nunca saem do browser. A perda de granularidade é aceitável para não expor identificadores de anúncios, conversas e usuários.
5. **Silêncio em produção sem endpoint:** evita poluir console do usuário final; a ausência de dados é documentada em `.env.example`.
6. **Sem `instrumentation-client.ts`:** o guia local diz que ele executa antes da hidratação para analytics/erros, mas não substitui o hook de Web Vitals. Criá-lo apenas por causa do texto da auditoria seria ruído.

## 6. Arquivos

- `src/components/performance/web-vitals.tsx` (novo)
- `src/components/performance/report-web-vital.ts` (novo)
- `src/components/performance/web-vitals.test.tsx` (novo)
- `src/components/performance/report-web-vital.test.ts` (novo)
- `src/app/layout.tsx`
- `.env.example`
- `docs/plans/015-issue-24-performance-audit.md`

## 7. Critérios de aceite (BDD)

- **Dado** o ambiente de desenvolvimento, **quando** uma métrica LCP/INP/CLS/TTFB/FCP é reportada, **então** `console.info` recebe nome, valor e rating, sem query string e sem UUID na URL.
- **Dado** `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` configurado em produção, **quando** uma métrica é reportada, **então** `navigator.sendBeacon` envia um payload JSON com a URL sanitizada ao endpoint.
- **Dado** o endpoint ausente em produção, **quando** uma métrica é reportada, **então** nenhuma requisição é feita e nada é escrito no console.
- **Dado** uma falha no `sendBeacon` ou uma URL inválida, **quando** a métrica é reportada, **então** nenhum erro é lançado na aplicação.
- **Dado** o layout raiz montado, **então** `useReportWebVitals` é chamado uma única vez com a mesma referência de callback.
- **Dado** o critério de cache de catálogo, **quando** a issue for revisada, **então** ele está documentado como já atendido por `updateTag(PRODUCTS_LIST_TAG)`, sem nova alteração em `products.service.ts`.

## 8. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`.

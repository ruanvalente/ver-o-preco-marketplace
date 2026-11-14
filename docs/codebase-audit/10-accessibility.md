# Phase 10 — Acessibilidade

## Objetivo
Garantir WCAG 2.2 AA em toda a aplicação.

## Contexto atual
Uso de shadcn/ui, `aria-*`, `role`, `aria-live`, `aria-describedby`, foco em formulários de auth.

## Problemas encontrados

### [P1] `aria-live` no chat ausente
**Arquivo:** `src/features/chat/components/message-list.tsx`
**Problema:** Novas mensagens não anunciadas por leitores de tela.
**Impacto:** Usuários com deficiência visual perdem mensagens.
**Por que:** Falta de `aria-live="polite"` ou `role="log"`.
**Solução:** Adicionar `aria-live` e `role="log"`.
**Arquivos envolvidos:** `message-list.tsx`.

### [P1] Focus ring em selects customizados
**Arquivo:** `src/features/products/components/catalog/product-filters-form.tsx`
**Problema:** Selects nativos com estilo customizado podem perder foco visível.
**Impacto:** Navegação por teclado difícil.
**Por que:** Falta de `focus-visible` ring.
**Solução:** Garantir `focus-visible:ring-2`.
**Arquivos envolvidos:** `product-filters-form.tsx`.

### [P2] Sheet/filter drawer sem focus trap verificado
**Arquivo:** `src/features/products/components/catalog/mobile-product-filters.tsx`
**Problema:** Sheet pode não prender foco.
**Impacto:** Teclado escapa.
**Por que:** Verificar `focus-trap`.
**Solução:** Testar com teclado.
**Arquivos envolvidos:** `mobile-product-filters.tsx`.

## Solução proposta
1. Adicionar `aria-live` no chat.
2. Garantir focus ring.
3. Verificar focus trap.

## Arquivos envolvidos
- Modificar: `message-list.tsx`, `product-filters-form.tsx`, `mobile-product-filters.tsx`.

## Plano de implementação
1. Adicionar `aria-live`.
2. Garantir focus ring.
3. Testar focus trap.

## Componentização
- Nenhuma.

## Performance
- Nenhuma.

## Acessibilidade
- Melhoria direta.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Testes de a11y com axe-core.

## Critérios de aceite
- [ ] `aria-live` no chat.
- [ ] Focus ring visível.
- [ ] Focus trap funcional.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. `aria-live`.
2. Focus ring.
3. Focus trap.

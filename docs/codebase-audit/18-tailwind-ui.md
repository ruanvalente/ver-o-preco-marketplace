# Phase 18 — Tailwind / UI

## Objetivo
Garantir consistência visual, tokens, componentes reutilizáveis.

## Contexto atual
shadcn/ui em `src/components/ui/`, DESIGN.md com cores, tipografia.

## Problemas encontrados

### [P2] Duplicação de classes em selects
**Arquivo:** `src/features/products/components/catalog/product-filters-form.tsx`
**Problema:** `selectClassName` definido localmente.
**Impacto:** Duplicação.
**Por que:** Falta de componente `Select`.
**Solução:** Extrair `Select` para `src/components/ui/select.tsx`.
**Arquivos envolvidos:** `product-filters-form.tsx`.

### [P3] Classes excessivamente longas
**Arquivo:** Vários componentes.
**Problema:** Uso de classes longas.
**Impacto:** Manutenibilidade.
**Por que:** Falta de abstração.
**Solução:** Usar `@apply` ou componentes.
**Arquivos envolvidos:** Vários.

## Solução proposta
1. Extrair `Select`.
2. Usar `@apply` onde apropriado.

## Arquivos envolvidos
- Modificar: `product-filters-form.tsx`
- Criar: `src/components/ui/select.tsx`.

## Plano de implementação
1. Extrair `Select`.
2. Usar `@apply`.

## Componentização
- `Select` componente.

## Performance
- Nenhuma.

## Acessibilidade
- Nenhuma.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Nenhum.

## Critérios de aceite
- [ ] `Select` extraído.
- [ ] Sem duplicação.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Extrair `Select`.
2. Usar `@apply`.
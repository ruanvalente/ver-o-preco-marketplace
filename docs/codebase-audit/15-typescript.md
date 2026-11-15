# Phase 15 — TypeScript

## Objetivo
Garantir type safety, reduzir `any`, casts, non-null assertions.

## Contexto atual
Uso de strict mode, interfaces, generics, unions.

## Problemas encontrados

### [P3] `as unknown as ProductRow` casts
**Arquivo:** `src/features/products/services/products.service.ts`, `src/features/chat/services/chat.service.ts`
**Problema:** Quebra de type safety.
**Impacto:** Qualidade.
**Por que:** Uso de casts.
**Solução:** Definir tipos de row.
**Arquivos envolvidos:** Modificar arquivos.

### [P3] Non-null assertions
**Arquivo:** Verificar uso de `!`.
**Problema:** Pode causar erros em runtime.
**Impacto:** Qualidade.
**Por que:** Uso de `!`.
**Solução:** Substituir por optional chaining.
**Arquivos envolvidos:** Modificar arquivos.

## Solução proposta
1. Definir tipos de row.
2. Substituir `!` por optional chaining.

## Arquivos envolvidos
- Modificar: `products.service.ts`, `chat.service.ts`.

## Plano de implementação
1. Definir tipos.
2. Substituir `!`.

## Componentização
- Nenhuma.

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
- [ ] Sem casts.
- [ ] Sem `!`.

## Riscos
- Nenhum.

## Dependências
- Phase 01.

## Ordem de implementação
1. Definir tipos.
2. Substituir `!`.
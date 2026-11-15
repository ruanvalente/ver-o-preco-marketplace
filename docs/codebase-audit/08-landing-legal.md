# Phase 08 — Landing e Legal

## Objetivo
Página de marketing inicial e páginas legais (privacy, terms, cookies, about).

## Contexto atual
Módulos `features/landing/` (hero, sections, footer, header mobile) e `features/legal/` (legal-placeholder-page).

## Problemas encontrados

### [P3] Conteúdo landing pode divergir do copy de produto
**Arquivo:** `src/features/landing/components/*`
**Problema:** Copy de marketing pode não refletir PRODUCT.md.
**Impacto:** Mensagem inconsistente.
**Solução:** Revisar copy com produto.

### [P3] Conteúdo legal é placeholder
**Arquivo:** `src/features/legal/components/legal-placeholder-page.tsx`
**Problema:** Texto legal não final.
**Impacto:** Conformidade.
**Solução:** Substituir por conteúdo final.

### [P3] Testes de landing insuficientes
**Arquivo:** `src/features/landing/tests/`
**Problema:** Apenas 1 arquivo de teste.
**Impacto:** Risco de regressão visual.
**Solução:** Adicionar testes de seções principais.

## Solução proposta
1. Revisar copy.
2. Substituir conteúdo legal.
3. Adicionar testes.

## Arquivos envolvidos
- Modificar: `landing/components/*`, `legal-placeholder-page.tsx`
- Criar: testes de landing.

## Plano de implementação
1. Revisar copy.
2. Substituir legal.
3. Adicionar testes.

## Componentização
- Nenhuma.

## Performance
- Imagens otimizadas com next/image.

## Acessibilidade
- Verificar headings e landmarks.

## Segurança
- Nenhuma.

## Supabase
- Nenhuma.

## Testes
- Adicionar testes de landing.

## Critérios de aceite
- [ ] Copy revisada.
- [ ] Legal final.
- [ ] Testes de landing.

## Riscos
- Nenhum.

## Dependências
- Nenhuma.

## Ordem de implementação
1. Revisar copy.
2. Substituir legal.
3. Adicionar testes.

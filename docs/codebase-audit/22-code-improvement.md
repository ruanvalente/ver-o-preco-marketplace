# Auditoria Arquitetural de Componentes React + Next.js

## Objetivo

Realize uma auditoria completa na arquitetura dos componentes React do projeto atual, com foco em **organização, separação de responsabilidades, legibilidade, manutenibilidade, reutilização e evolução segura do código**.

O objetivo principal é identificar componentes que atualmente misturam responsabilidades e propor uma organização baseada no **caso de uso do componente**, separando claramente:

- Componentes puramente visuais (UI)
- Componentes com lógica de apresentação/interação (Widgets)
- Hooks
- Composition
- Server Components
- Server Actions
- Utilitários
- Serviços
- Outros tipos de abstrações necessárias

### Regra principal

**Não altere o código durante esta etapa.**

Primeiro realize a auditoria completa, documente os problemas encontrados, classifique os componentes e proponha um plano de migração incremental.

A prioridade é **melhorar a arquitetura sem quebrar o comportamento existente**.

Não faça refatorações desnecessárias apenas por preferência estética.

---

# 1. Escopo da Auditoria

Analise todos os componentes React/Next.js relevantes do projeto, incluindo:

- `components/`
- componentes dentro de `features/`
- componentes dentro de páginas/rotas
- `app/`
- `pages/`, caso exista
- layouts
- templates
- forms
- modais
- dialogs
- cards
- tables
- lists
- widgets
- componentes reutilizáveis
- Server Components
- Client Components
- hooks
- utilities
- services
- Server Actions
- integrações relacionadas aos componentes
- arquivos de teste relacionados

Analise também as dependências entre esses elementos.

---

# 2. Classificação dos Componentes

Para cada componente identificado, determine qual é o seu papel arquitetural.

## 2.1 UI Components

Um componente deve ser classificado como `UI` quando sua responsabilidade principal for **apresentação visual**.

Características esperadas:

- Renderização visual
- Props simples
- Estilização
- Estados visuais mínimos
- Nenhuma regra de negócio
- Nenhuma chamada de API
- Nenhuma chamada direta ao banco
- Nenhuma regra complexa de transformação de dados
- Nenhuma dependência de Server Action
- Nenhuma lógica de domínio

Exemplos:

- Button
- Input
- Select
- Badge
- Card
- Dialog
- Avatar
- Table
- EmptyState
- Skeleton
- Typography

### Nomenclatura

Utilize:

```text
component-name.ui.tsx
component-name.ui.test.tsx
```

Exemplo:

```text
button.ui.tsx
button.ui.test.tsx
```

---

# 2.2 Widget Components

Um componente deve ser classificado como `Widget` quando possuir **lógica de apresentação, interação ou composição**, mas ainda representar uma unidade funcional da interface.

Um Widget pode conter:

- Estado local
- Interações
- Event handlers
- Controle de loading
- Controle de error
- Integração com hooks
- Composição de componentes UI
- Orquestração de dados para apresentação
- Interação com filtros
- Paginação
- Busca
- Formulários
- Modais
- Tabs
- Controle de estados da interface

Porém, evite colocar lógica excessivamente grande diretamente dentro do componente.

### Nomenclatura

```text
component-name.widget.tsx
component-name.widget.test.tsx
```

Exemplo:

```text
product-list.widget.tsx
product-list.widget.test.tsx
```

---

# 2.3 Hooks

Quando a lógica de um Widget estiver ficando extensa, repetitiva ou difícil de testar, avalie sua extração para um Hook.

Exemplos:

```text
use-product-search.ts
use-pagination.ts
use-product-filters.ts
use-modal.ts
```

Um Hook deve ser extraído quando isso melhorar:

- Legibilidade
- Testabilidade
- Reutilização
- Separação de responsabilidades
- Manutenção
- Composição

Não crie Hooks apenas para mover algumas linhas de código.

A extração deve possuir justificativa arquitetural.

---

# 2.4 Composition

Quando um componente estiver responsável por muitas partes independentes da interface, avalie utilizar Composition.

Exemplo conceitual:

```tsx
<ProductCard>
  <ProductCard.Image />
  <ProductCard.Content>
    <ProductCard.Title />
    <ProductCard.Price />
    <ProductCard.Actions />
  </ProductCard.Content>
</ProductCard>
```

Avalie Composition principalmente quando:

- Existem muitas props condicionais
- Existem muitos estados visuais
- Existem múltiplas variações do mesmo componente
- O componente possui responsabilidades independentes
- O componente está ficando difícil de entender
- Existem muitos `if`, ternários ou branches de renderização

Não aplicar Composition indiscriminadamente.

---

# 2.5 Server Components

Identifique componentes que podem permanecer como Server Components.

Verifique:

- Se realmente precisam de `"use client"`
- Se possuem APIs exclusivas do browser
- Se utilizam hooks de cliente
- Se possuem event handlers
- Se dependem de estado local
- Se podem realizar fetching no servidor
- Se podem reduzir JavaScript enviado ao cliente

Sempre que possível, mantenha a lógica no servidor quando isso for compatível com a arquitetura atual.

---

# 2.6 Server Actions

Identifique operações que devem utilizar Server Actions.

Avalie especialmente:

- Mutations
- Criação de registros
- Atualizações
- Exclusões
- Operações autenticadas
- Operações que necessitam de acesso seguro ao servidor
- Interações com banco de dados
- Operações que não deveriam expor lógica sensível ao cliente

Quando apropriado, proponha a separação:

```text
UI
↓
Widget
↓
Hook / Composition
↓
Server Action
↓
Service / Repository
↓
Database / External API
```

Não mover automaticamente toda lógica para Server Actions.

A classificação deve considerar o comportamento atual e as responsabilidades de cada camada.

---

# 3. Outras Categorias

Caso um componente não se encaixe adequadamente nas categorias anteriores, identifique o tipo correto.

Considere categorias como:

```text
ui
widget
hook
server
action
service
utility
provider
layout
template
feature
```

A nomenclatura deve refletir o **caso de uso real do arquivo**, e não apenas uma preferência estética.

Exemplos:

```text
product-card.ui.tsx
product-list.widget.tsx
use-product-search.ts
create-product.action.ts
product.service.ts
format-price.utility.ts
auth.provider.tsx
dashboard.layout.tsx
product-page.template.tsx
```

Caso outro padrão seja mais apropriado para o projeto, explique o motivo antes de propor a alteração.

---

# 4. Auditoria de Responsabilidades

Para cada componente, analise:

### Responsabilidade

- O componente possui uma única responsabilidade?
- Ele mistura UI e regra de negócio?
- Ele possui lógica de domínio?
- Ele possui lógica de apresentação?
- Ele possui acesso a dados?
- Ele possui chamadas de API?
- Ele possui Server Actions?
- Ele possui estado?
- Ele possui efeitos?
- Ele possui lógica que deveria estar em Hook?
- Ele possui lógica que deveria estar em utility?
- Ele possui lógica que deveria estar em service?
- Ele possui composição excessivamente complexa?

### Complexidade

Avalie:

- Tamanho do arquivo
- Quantidade de responsabilidades
- Quantidade de estados
- Quantidade de efeitos
- Quantidade de handlers
- Quantidade de condicionais
- Quantidade de props
- Quantidade de dependências
- Complexidade de renderização
- Reutilização
- Acoplamento

---

# 5. Regra para Componentes Grandes

Não considere automaticamente que um componente grande precisa ser dividido.

Primeiro determine **por que ele é grande**.

Caso o problema seja:

### UI excessiva

→ avaliar divisão em componentes `.ui.tsx`

### Lógica de interação excessiva

→ avaliar Widget + Hooks

### Regras de domínio

→ avaliar Service / Utility / camada de domínio

### Dados no servidor

→ avaliar Server Component

### Mutations

→ avaliar Server Action

### Muitas partes independentes da UI

→ avaliar Composition

### Código repetido

→ avaliar abstração reutilizável

A divisão deve ser baseada em responsabilidade e coesão.

---

# 6. Regra de Segurança da Refatoração

O objetivo não é reescrever o sistema.

Preserve:

- Comportamento atual
- Contratos existentes
- APIs
- Regras de negócio
- UX
- Acessibilidade
- Testes existentes
- Integrações
- Estados
- Fluxos de usuário

Evite:

- Mudanças funcionais
- Mudanças de design não solicitadas
- Alteração de regras de negócio
- Refatorações especulativas
- Abstrações prematuras
- Criação excessiva de arquivos
- Fragmentação exagerada dos componentes

A refatoração deve ser **incremental e de baixo risco**.

---

# 7. Testes

Para cada componente que será migrado, verifique o teste correspondente.

Exemplo:

```text
product-card.ui.tsx
product-card.ui.test.tsx
```

ou:

```text
product-list.widget.tsx
product-list.widget.test.tsx
```

Avalie:

- Se existe teste
- Se o teste está no local correto
- Se o teste cobre comportamento importante
- Se a mudança de classificação exige alteração do teste
- Se o teste está excessivamente acoplado à implementação
- Se o teste deveria permanecer como está

Não crie testes artificiais apenas para aumentar cobertura.

Priorize comportamento observável.

---

# 8. Comentários

Os comentários do código devem ser escritos **somente em inglês**.

Não adicionar comentários desnecessários.

Comentários devem existir somente quando explicarem algo que não seja óbvio pelo código.

Priorize comentários para:

- Decisões arquiteturais
- Workarounds
- Regras complexas
- Comportamentos inesperados
- Integrações externas
- Motivos de uma implementação específica

Evite comentários como:

```ts
// Set loading to true
setLoading(true);
```

Prefira código autoexplicativo.

---

# 9. Análise por Feature

Após analisar todos os componentes, agrupe os problemas por **feature de negócio**, e não apenas por pasta.

Exemplos:

```text
Authentication
Products
Listings
Favorites
Chat
Checkout
Profile
Search
Dashboard
Notifications
```

Para cada Feature, identifique:

- Componentes UI
- Widgets
- Hooks
- Server Components
- Server Actions
- Services
- Utilities
- Testes
- Dependências
- Problemas arquiteturais

---

# 10. Matriz de Migração

Crie uma tabela consolidada com todos os componentes que precisam de alteração.

Utilize o seguinte formato:

| Feature  | Componente Atual | Tipo Atual | Tipo Proposto | Arquivo Atual | Arquivo Proposto           | Motivo                             | Risco | Teste |
| -------- | ---------------- | ---------- | ------------- | ------------- | -------------------------- | ---------------------------------- | ----- | ----- |
| Products | ProductCard      | Mixed      | UI            | ...           | product-card.ui.tsx        | Remove lógica do componente visual | Baixo | Sim   |
| Products | ProductList      | Mixed      | Widget        | ...           | product-list.widget.tsx    | Possui estado e interação          | Médio | Sim   |
| Search   | SearchProducts   | Mixed      | Widget + Hook | ...           | search-products.widget.tsx | Lógica complexa                    | Médio | Sim   |

Não omita componentes apenas porque a alteração é pequena.

---

# 11. Priorização

Classifique cada migração:

### P0 — Crítico

Problemas que dificultam significativamente:

- Manutenção
- Segurança
- Performance
- Correção
- Arquitetura

### P1 — Alta prioridade

Componentes altamente acoplados ou muito complexos.

### P2 — Média prioridade

Melhorias importantes de organização e legibilidade.

### P3 — Baixa prioridade

Melhorias incrementais que não apresentam impacto significativo.

---

# 12. Fases de Implementação

Após a auditoria, crie um plano incremental.

Exemplo:

## Phase 01 — Foundation

- Definir convenções
- Definir nomenclatura
- Definir estrutura
- Definir regras de UI / Widget
- Definir estratégia de testes

## Phase 02 — Authentication

Features impactadas:

- Authentication
- User Session

Componentes:

- ...

## Phase 03 — Products

Features impactadas:

- Products
- Search

Componentes:

- ...

## Phase 04 — Favorites

Features impactadas:

- Favorites
- Products

Componentes:

- ...

## Phase 05 — Chat

Features impactadas:

- Chat
- Notifications

Componentes:

- ...

As fases devem ser determinadas com base nas dependências reais encontradas no projeto.

Não invente fases sem justificativa.

---

# 13. Dependências entre Fases

Crie uma matriz:

| Fase           | Depende de     | Bloqueia       | Pode executar paralelamente |
| -------------- | -------------- | -------------- | --------------------------- |
| Foundation     | —              | Authentication | —                           |
| Authentication | Foundation     | Products       | —                           |
| Products       | Authentication | Favorites      | Search                      |
| Search         | Products       | —              | Favorites                   |

Utilize as dependências reais encontradas na auditoria.

---

# 14. Issues

Depois de concluir a auditoria, proponha as Issues necessárias para executar a migração.

Cada Issue deve conter:

## Título

Utilize um título objetivo.

Exemplo:

```text
refactor(products): separate UI components from widgets
```

## Contexto

Explique:

- Problema identificado
- Por que o problema existe
- Impacto atual
- Objetivo da alteração

## Phase

Informe claramente:

```text
Phase: 03 — Products
```

## Features Impacted

Liste explicitamente:

```text
Features impacted:
- Products
- Search
- Favorites
```

## Components

Liste:

```text
Components:
- ProductCard
- ProductList
- ProductFilters
```

## Current Architecture

Descreva como está atualmente.

## Proposed Architecture

Descreva como deverá ficar.

## Migration

Liste os passos necessários.

## Acceptance Criteria

Defina critérios objetivos.

Exemplo:

```text
- [ ] UI components contain no business logic
- [ ] Widget owns interaction logic
- [ ] Complex logic is extracted into hooks
- [ ] Server mutations use Server Actions when appropriate
- [ ] Existing behavior remains unchanged
- [ ] Existing tests continue passing
- [ ] New tests are added only where necessary
- [ ] Comments are written in English
- [ ] Naming convention is applied consistently
```

## Risk

Classifique:

```text
Low
Medium
High
```

E explique o motivo.

---

# 15. Issue Dependency Graph

Depois de criar as Issues propostas, determine a ordem recomendada.

Exemplo:

```text
Phase 01
   ↓
Phase 02
   ↓
Phase 03
   ├── Phase 04
   └── Phase 05
          ↓
       Phase 06
```

Explique quais Issues podem ser executadas paralelamente.

---

# 16. Resultado Final da Auditoria

A resposta final deve seguir esta estrutura:

# React / Next.js Component Architecture Audit

## 1. Executive Summary

Resumo geral da arquitetura atual.

## 2. Current Architecture

Explique como os componentes estão organizados atualmente.

## 3. Main Problems

Liste os principais problemas encontrados.

## 4. Component Classification

Tabela com todos os componentes analisados.

## 5. Migration Matrix

Tabela consolidada dos componentes que precisam ser migrados.

## 6. Feature-Based Migration Plan

Plano separado por Feature.

## 7. Phases

Lista das fases propostas.

## 8. Dependency Matrix

Dependências entre fases.

## 9. Proposed Issues

Lista completa das Issues que deverão ser abertas.

## 10. Risk Assessment

Riscos e impacto de cada grupo de alteração.

## 11. Final Architecture

Descreva como deverá ficar a arquitetura após a conclusão da migração.

## 12. Naming Convention

Documente definitivamente os padrões adotados.

Exemplo:

```text
*.ui.tsx
*.ui.test.tsx

*.widget.tsx
*.widget.test.tsx

use-*.ts
use-*.test.ts

*.action.ts
*.action.test.ts

*.service.ts
*.service.test.ts

*.utility.ts
*.utility.test.ts
```

Somente utilize extensões adicionais quando realmente fizerem sentido para o projeto.

---

# Regra Final

Antes de propor qualquer migração, responda para cada componente:

> "Qual responsabilidade este componente realmente possui?"

Depois responda:

> "Qual é o tipo de componente mais adequado para essa responsabilidade?"

E somente então determine a migração.

**Não refatore por tamanho. Refatore por responsabilidade.**

**Não crie abstrações por antecipação. Crie abstrações quando houver uma responsabilidade clara.**

**Não quebre código funcional apenas para seguir uma convenção.**

O objetivo final é obter uma arquitetura React/Next.js:

- previsível
- legível
- testável
- modular
- escalável
- fácil de manter
- orientada a features
- com separação clara entre UI e lógica
- com Server Components e Server Actions utilizados adequadamente
- sem alterar o comportamento funcional existente.

Utilize as skills e MCP's disponiveis no projeto para auxiliar no processo da análise e criação das issues.

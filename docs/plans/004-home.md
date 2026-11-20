**Implementação da Página Inicial do Marketplace (Home / Explorar) — Ver-o-Preço Marketplace**

Implemente a página inicial do marketplace do Ver-o-Preço utilizando Next.js + TypeScript + Tailwind CSS + React, tomando como referência visual a imagem fornecida.

A implementação deve reproduzir a estrutura visual, hierarquia, espaçamentos, tipografia, cores, componentes, estados e comportamento responsivo apresentados na referência.

A imagem deve ser utilizada **apenas como referência visual**. Não utilizar a captura de tela como background, imagem ou elemento da interface.

A página deve ser construída utilizando HTML semântico, React e Tailwind CSS.

### 1. Stack obrigatória

Utilizar:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React para ícones
- Componentização reutilizável

Se o projeto já possuir:

- Design System
- componentes de Button / Input / Select / Card / Badge
- tokens
- biblioteca de ícones
- sistema de busca ou filtros

reutilizar os recursos existentes.

Não introduzir bibliotecas novas sem necessidade.

Caso exista `DESIGN.md`, ele deve ser tratado como fonte de verdade visual.

### 2. Objetivo da página

A página inicial do marketplace permite que o usuário:

- encontre produtos próximos a ele no Pará;
- busque por texto, localização e categoria;
- navegue rapidamente pelas categorias populares;
- visualize anúncios recentes;
- inicie a publicação de um anúncio;
- sinta segurança e confiança na plataforma.

A experiência deve transmitir:

- modernidade
- simplicidade
- foco regional (Pará)
- agilidade
- confiança
- ausência de burocracia
- sensação de marketplace local e seguro

### 3. Estrutura geral

A página deve possuir a seguinte estrutura:

```
MarketplaceHomePage
│
├── Header
│   ├── BrandLogo + BrandName
│   ├── LocationSelector (Região / Polo)
│   ├── GlobalSearch
│   ├── UserMenu (avatar + nome)
│   └── PrimaryCTA (Anunciar produto)
│
├── CategoryNavigation
│   └── CategoryTabs / Links
│
├── HeroSection
│   ├── Badge (Marketplace ativo em X municípios)
│   ├── Title
│   ├── Description
│   └── SearchBar
│       ├── TextSearch
│       ├── LocationSelect
│       ├── CategorySelect
│       └── SearchButton
│   └── QuickSuggestions (tags)
│
├── PopularCategoriesSection
│   ├── SectionHeader
│   └── CategoryGrid (8 cards)
│
├── RecentListingsSection
│   ├── SectionHeader + LiveBadge
│   └── ProductGrid (8 cards)
│
├── SellCTASection
│   ├── Title
│   ├── Description
│   ├── Steps (1-2-3)
│   └── PrimaryCTA
│
├── TrustSection
│   ├── SectionHeader
│   └── TrustCards (3 cards)
│
└── Footer
```

### 4. Layout geral

**Desktop:**

- Container máximo aproximado: `1200px – 1320px`
- Background global: `#F8F7FC` (ou token equivalente)
- Espaçamento vertical generoso entre seções
- Grids bem definidos

**Mobile:**

- Tudo em coluna única
- Search bar empilhada
- Grids de produtos e categorias adaptados
- CTAs em largura total quando necessário

### 5. Header

Estrutura:

```
[Logo] Ver-o-Preço   [Região: Belém e Região Metropolitana ▼]   [Busca global]   [Avatar + Nome]   [+ Anunciar produto]
```

Características:

- background branco
- borda inferior sutil
- sticky no scroll (recomendado)
- altura aproximada 72–80px
- botão primário roxo à direita
- seletor de região com ícone de localização

### 6. Category Navigation (abaixo do header)

Barra horizontal de categorias:

```
Todas as Categorias | Celulares & Telefonia | Eletrônicos | Informática | Casa & Móveis | Veículos | Moda & Beleza | Esportes & Lazer | + Meus Anúncios
```

- scroll horizontal em mobile
- item ativo com destaque visual
- hover e focus-visible

### 7. Hero Section

**Badge:**

```
Marketplace ativo em 14+ municípios paraenses • Polo Belém
```

**Título:**

```
Encontre o que você precisa.
Venda o que não usa no Pará.
```

- aproximadamente 36–44px desktop
- font-weight 700–800
- line-height apertado

**Descrição:**
Texto curto sobre comprar e vender perto de você com rapidez, simplicidade e segurança.

**Search Bar (elemento principal):**

```
[Busca]  O que você está procurando hoje?     [Localização ▼]     [Categoria ▼]     [Buscar agora]
```

Características:

- altura generosa (~56–64px)
- border-radius grande
- sombra sutil
- botão de busca roxo
- campos com ícones

**Quick Suggestions (tags abaixo da busca):**

```
Em alta no Pará:  iPhone 15  •  PlayStation 5  •  Mesa de escritório  •  Bicicleta aro 29  •  Geladeira Frost Free
```

### 8. Popular Categories Section

**Header:**

```
Categorias Populares                    Ver catálogo completo →
```

Grid de 8 categorias (ícone + nome + contagem de anúncios):

- Celulares
- Eletrônicos
- Informática
- Casa & Móveis
- Veículos
- Moda
- Games
- Esportes

Cada card:

- ícone colorido em fundo suave
- nome
- contagem de anúncios
- hover com elevação sutil

### 9. Recent Listings Section

**Header:**

```
Recém-publicados em Belém e Região     ● Atualizado há 4 min     Ver todos (1.248) →
```

Grid de 8 Product Cards.

**Product Card estrutura:**

```
┌─────────────────────────────┐
│ [Imagem]          [♥]       │
│                             │
│ R$ 4.500                    │
│ iPhone 15 Pro 256GB ...     │
│ Belém - Nazaré • Lucas M.   │
│ Há 25 min                   │
└─────────────────────────────┘
```

Elementos do card:

- imagem com aspect-ratio consistente
- badge de condição (Seminovo, Excelente, Bom estado, etc.)
- botão de favorito (coração)
- preço em destaque
- título do anúncio (2 linhas max)
- localização + vendedor
- tempo relativo (“Há 25 min”, “Há 1 hora”…)

### 10. Sell CTA Section

Banner com gradiente escuro/roxo-verde:

**Título:**

```
Tem algo parado em casa?
Venda no Ver-o-Preço hoje mesmo.
```

**Descrição:**
Texto incentivando a transformar itens em desuso em renda.

**Steps (lado direito ou abaixo):**

1. Fotografe seu item
2. Publique em 2 minutos
3. Negocie pelo chat direto

**CTA:**

```
Começar a desapegar grátis
```

### 11. Trust Section (“Compre e venda com total tranquilidade”)

Três cards:

1. **Negociação Direta sem taxas abusivas**
2. **Comunidade Verificada com perfis reais**
3. **Chat Seguro em tempo real**

Cada card com ícone, título e descrição curta.

### 12. Footer

Colunas:

- Ver-o-Preço (descrição + logo)
- Sobre a Ver-o-Preço
- Para Compradores
- Para Vendedores
- Polos Atendidos (PA)

Links legais no rodapé inferior.

### 13. Design Tokens (referência)

```
Primary:           #741B78
Primary Hover:     variação mais escura
Page Background:   #F8F7FC
Surface:           #FFFFFF
Text Primary:      #17213A
Text Secondary:    #5B5260
Success:           #3B7668
Success Background:#C7F1DF
Lavender:          #EEF0FF
Border:            #ECEAF1
```

### 14. Tipografia

```
H1 (Hero):     36–44px / 700–800
H2 (Seções):   28–32px / 700
H3 (Cards):    16–18px / 600
Body:          14–16px / 400–500
Small:         12–13px / 500
Price:         18–20px / 700
```

### 15. Responsividade

**Desktop (≥ 1024px):**

- Search bar em linha
- Categorias em 4–8 colunas
- Produtos em 4 colunas
- CTA com layout horizontal

**Tablet:**

- Produtos em 2–3 colunas
- Categorias em 4 colunas

**Mobile (< 768px):**

- Search bar empilhada (busca + localização + categoria + botão)
- Categorias em scroll horizontal ou 2 colunas
- Produtos em 1 ou 2 colunas
- Steps do CTA empilhados
- Header simplificado (logo + busca + menu)

### 16. Componentização sugerida

```
components/
└── marketplace/
    ├── header/
    │   ├── marketplace-header.tsx
    │   ├── location-selector.tsx
    │   └── user-menu.tsx
    ├── search/
    │   ├── hero-search-bar.tsx
    │   └── quick-suggestions.tsx
    ├── categories/
    │   ├── category-nav.tsx
    │   └── popular-categories.tsx
    ├── listings/
    │   ├── recent-listings.tsx
    │   └── product-card.tsx
    ├── cta/
    │   └── sell-cta-banner.tsx
    ├── trust/
    │   └── trust-section.tsx
    └── footer/
        └── marketplace-footer.tsx
```

### 17. Estados e Interações

- Loading skeletons nos grids de produtos e categorias
- Hover nos cards de produto (elevação + sombra)
- Favorito com estado ativo/inativo
- Search bar com focus states
- Botões com estados default / hover / active / disabled / loading
- Badge “Atualizado há X min” com atualização periódica (opcional)

### 18. Preparação para dados

A interface deve ser desacoplada da origem dos dados.

Criar interfaces/types:

```ts
type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  condition: string;
  location: string;
  seller: string;
  publishedAt: string;
  // ...
};

type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
};
```

Utilizar mock data inicialmente, preparado para integração futura com API/Supabase.

### 19. Acessibilidade

- HTML semântico
- labels reais nos campos de busca e selects
- `aria-label` em botões de ícone (favorito, etc.)
- contraste adequado
- navegação por teclado
- focus-visible
- textos alternativos nas imagens dos produtos

### 20. Instruções finais para o agente

Antes de implementar:

1. Analise a estrutura atual do projeto.
2. Identifique a versão do Next.js e a configuração do Tailwind.
3. Localize `DESIGN.md` e componentes existentes (Button, Input, Select, Card, Badge).
4. Reutilize ao máximo o Design System existente.
5. Não sobrescreva configurações existentes sem necessidade.
6. Implemente de forma incremental (Header → Hero → Categorias → Listagens → CTA → Trust → Footer).
7. Execute TypeScript/lint após a implementação.
8. Verifique responsividade em desktop, tablet e mobile.
9. Compare visualmente com a referência.
10. Ajuste espaçamentos, tipografia, border-radius e sombras antes de considerar a tarefa concluída.

**Prioridades**

1. Fidelidade visual à referência
2. Responsividade
3. Acessibilidade
4. Componentização
5. Manutenibilidade
6. Performance (imagens otimizadas, lazy loading)
7. Preparação para integração com dados reais

Não adicionar funcionalidades ou elementos visuais que não estejam relacionados à página inicial do marketplace.

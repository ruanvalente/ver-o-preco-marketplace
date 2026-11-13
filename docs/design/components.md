## 1. Objetivo

Este documento define as regras para criação, organização, composição e reutilização dos componentes visuais do Ver-o-Preço.

Ele complementa o `DESIGN.md` e deve ser utilizado em conjunto com:

- `AGENTS.md`
- `docs/architecture/overview.md`
- `docs/architecture/modules.md`
- `docs/architecture/supabase.md`

O objetivo é manter uma interface consistente, acessível, responsiva e fácil de evoluir sem transformar os componentes compartilhados em um grande acoplamento entre features.

---

## 2. Princípios

Os componentes devem seguir estes princípios:

1. **Reutilização sem abstração prematura**
2. **Composição antes de duplicação**
3. **Responsabilidade única**
4. **Acessibilidade por padrão**
5. **Mobile-first**
6. **Estados completos**
7. **Consistência visual**
8. **Baixo acoplamento entre features**
9. **Domínio próximo de sua feature**
10. **shadcn/ui como base, não como limite**

Um componente só deve ser promovido para uma camada compartilhada quando existir uma necessidade real de reutilização.

---

## 3. Hierarquia de componentes

A arquitetura visual segue três níveis principais:

```text
components/
├── ui/
│   └── primitives compartilhadas
│
├── layout/
│   └── estrutura global da aplicação
│
└── features/
    └── componentes específicos do domínio
```

Na prática:

```text
src/
├── components/
│   ├── ui/
│   └── layout/
│
└── features/
    ├── auth/
    │   └── components/
    ├── profile/
    │   └── components/
    ├── products/
    │   └── components/
    ├── listings/
    │   └── components/
    ├── favorites/
    │   └── components/
    ├── chat/
    │   └── components/
    └── dashboard/
        └── components/
```

### Regra

Quanto mais específico for o comportamento do componente, mais próximo da feature ele deve permanecer.

---

# 4. `components/ui`

Contém primitives visuais e componentes genéricos que não conhecem regras específicas do marketplace.

Exemplos:

- Button
- Input
- Textarea
- Label
- Select
- Checkbox
- Radio Group
- Switch
- Dialog
- Drawer
- Sheet
- Dropdown Menu
- Popover
- Tooltip
- Tabs
- Badge
- Avatar
- Card
- Separator
- Skeleton
- Alert
- Progress
- Scroll Area

Esses componentes devem ser preferencialmente baseados em `shadcn/ui`.

### Regras

Um componente em `components/ui`:

- não deve conhecer `products`;
- não deve conhecer `listings`;
- não deve acessar Supabase;
- não deve conter regra de negócio;
- não deve depender de uma feature específica;
- deve ser reutilizável em diferentes contextos.

Exemplo:

```tsx
<Button variant="primary">Publicar anúncio</Button>
```

O `Button` não deve saber o que significa "publicar".

---

# 5. `components/layout`

Contém componentes estruturais compartilhados por diferentes páginas.

Exemplos:

```text
components/layout/
├── header/
├── footer/
├── container/
├── navigation/
├── mobile-navigation/
├── page-header/
└── app-shell/
```

Possíveis componentes:

- Header
- Footer
- Main Navigation
- Mobile Navigation
- Container
- Page Header
- Breadcrumbs
- App Shell

### Regra

Componentes de layout podem conhecer conceitos gerais da aplicação, mas devem evitar lógica de domínio.

Por exemplo, o Header pode exibir o usuário autenticado, mas não deve conter toda a lógica de gerenciamento de anúncios.

---

# 6. Componentes de Feature

Componentes específicos devem permanecer dentro da própria feature.

Exemplo:

```text
features/products/components/
├── product-card.tsx
├── product-gallery.tsx
├── product-filters.tsx
├── product-list.tsx
└── product-seller.tsx
```

Para listings:

```text
features/listings/components/
├── listing-form.tsx
├── listing-preview.tsx
├── image-uploader.tsx
└── listing-status.tsx
```

Para chat:

```text
features/chat/components/
├── conversation-list.tsx
├── conversation-item.tsx
├── chat-header.tsx
├── message-list.tsx
├── message-item.tsx
├── message-composer.tsx
└── product-context.tsx
```

Esses componentes podem conhecer regras da própria feature.

---

# 7. Quando criar um componente

Criar um componente quando:

- existe reutilização real;
- existe uma responsabilidade visual clara;
- a composição ficou complexa;
- existe necessidade de testes isolados;
- existe um padrão visual que deve permanecer consistente;
- o componente possui estados próprios;
- a extração melhora legibilidade.

Evitar criar componentes apenas para transformar cada pequena parte de JSX em um arquivo.

---

# 8. Quando promover para compartilhado

Um componente específico de feature pode ser promovido para `components/ui` ou `components/layout` quando:

- é utilizado por múltiplas features;
- possui comportamento estável;
- não depende de regras de domínio;
- sua API pode ser genérica;
- a reutilização é comprovada.

### Exemplo

Inicialmente:

```text
features/products/components/status-badge.tsx
```

Se o mesmo padrão passar a ser utilizado em:

- products;
- listings;
- dashboard;
- chat;

pode fazer sentido criar uma abstração compartilhada.

Não promover automaticamente apenas porque "parece reutilizável".

---

# 9. Product Card

O Product Card é um componente central do marketplace.

Local:

```text
features/products/components/product-card.tsx
```

Responsabilidades:

- Exibir imagem principal.
- Exibir título.
- Exibir preço.
- Exibir localização.
- Exibir condição.
- Exibir favorito quando integrado.
- Linkar para o detalhe.

Não deve:

- buscar dados sozinho sem necessidade;
- criar favoritos diretamente;
- abrir chat diretamente sem composição;
- conhecer regras de autenticação.

Preferir composição:

```tsx
<ProductCard product={product}>
  <FavoriteButton />
</ProductCard>
```

Quando a integração exigir comportamento específico, a feature pode fornecer uma composição especializada.

---

# 10. Product Gallery

Local:

```text
features/products/components/product-gallery.tsx
```

Responsabilidades:

- Exibir imagem principal.
- Exibir thumbnails.
- Permitir navegação.
- Exibir fallback quando não houver imagem.
- Suportar teclado quando houver interação.

Requisitos:

- imagens responsivas;
- `alt` adequado;
- lazy loading quando apropriado;
- evitar layout shift;
- estados de carregamento/erro.

---

# 11. Product Filters

Local:

```text
features/products/components/product-filters.tsx
```

Responsabilidades:

- Categoria.
- Faixa de preço.
- Condição.
- Localização.
- Ordenação.

O componente deve representar o estado dos filtros, mas a consulta de dados deve permanecer na camada apropriada da feature.

No mobile, filtros podem utilizar `Drawer` ou `Sheet`.

---

# 12. Seller Components

Informações do vendedor podem ser representadas por componentes específicos:

```text
features/profile/components/
features/products/components/
```

Exemplos:

- Seller Card
- Seller Avatar
- Seller Meta
- Seller Presence

Esses componentes devem reutilizar dados do módulo `profile`, sem duplicar a definição do perfil.

---

# 13. Listing Form

Local:

```text
features/listings/components/listing-form.tsx
```

O formulário deve ser dividido em grupos lógicos:

```text
ListingForm
├── BasicInformation
├── Category
├── Condition
├── Price
├── Location
├── ImageUploader
└── PublicationActions
```

A divisão deve ser feita somente quando melhorar manutenção e legibilidade.

Requisitos:

- labels explícitos;
- mensagens de erro;
- estados de loading;
- validação;
- acessibilidade;
- prevenção de submissões duplicadas;
- feedback de sucesso/erro.

---

# 14. Image Uploader

Local:

```text
features/listings/components/image-uploader.tsx
```

Responsabilidades:

- Selecionar imagens.
- Validar arquivos.
- Mostrar preview.
- Mostrar progresso.
- Reordenar.
- Definir imagem principal.
- Remover imagem.

Não deve assumir que todo upload de imagem pertence a listings.

Se no futuro houver necessidade de um uploader genérico, criar uma primitive compartilhada somente após identificar casos reais de reutilização.

---

# 15. Favorite Button

Local:

```text
features/favorites/components/favorite-button.tsx
```

Responsabilidades:

- Exibir estado favorito/não favorito.
- Executar ação de adicionar/remover.
- Informar loading.
- Tratar erro.
- Possuir accessible name.

Não deve implementar diretamente queries SQL ou lógica de Supabase.

Essa responsabilidade pertence ao service/hook da feature.

---

# 16. Chat Components

O chat possui componentes especializados:

```text
features/chat/components/
├── conversation-list.tsx
├── conversation-item.tsx
├── chat-header.tsx
├── product-context.tsx
├── message-list.tsx
├── message-item.tsx
└── message-composer.tsx
```

### Conversation List

Exibe:

- conversas;
- último conteúdo;
- horário;
- indicador de não lidas;
- contexto do anúncio.

### Chat Header

Exibe:

- vendedor/comprador;
- avatar;
- presença;
- anúncio relacionado.

### Message List

Responsável por:

- agrupamento visual;
- mensagens;
- estados de envio;
- imagens;
- leitura.

### Message Composer

Responsável por:

- texto;
- upload de imagem;
- envio;
- loading;
- erro.

Realtime deve permanecer na camada de hooks/services, não espalhado por todos os componentes visuais.

---

# 17. Dashboard Components

Componentes de dashboard pertencem a:

```text
features/dashboard/components/
```

Exemplos:

- Dashboard Summary
- Quick Actions
- Listing Metrics
- Recent Listings
- Recent Conversations

Evitar criar um dashboard excessivamente denso.

O dashboard deve priorizar:

1. ações importantes;
2. informações relevantes;
3. atividades recentes.

---

# 18. Form Components

Formulários devem utilizar primitives compartilhadas sempre que possível:

```text
Label
Input
Textarea
Select
Checkbox
RadioGroup
Switch
Button
```

Composição:

```tsx
<FormField>
  <Label />
  <Input />
  <FormMessage />
</FormField>
```

Regras:

- todo campo possui label;
- mensagens devem estar associadas ao campo;
- erros não devem depender somente de cor;
- campos obrigatórios devem ser identificáveis;
- loading deve bloquear ações duplicadas quando necessário.

---

# 19. Buttons

Variantes recomendadas:

- Primary
- Secondary
- Ghost
- Destructive

Usar a hierarquia visual definida no `DESIGN.md`.

### Primary

Ação principal da página.

Exemplos:

- Publicar anúncio.
- Entrar.
- Enviar mensagem.

### Secondary

Ações importantes, mas não primárias.

### Ghost

Ações secundárias de baixo destaque.

### Destructive

Ações destrutivas:

- Excluir.
- Remover.
- Despublicar quando apropriado.

Evitar múltiplos botões primary competindo no mesmo contexto.

---

# 20. Cards

Cards devem agrupar informações relacionadas.

Usar cards para:

- Produtos.
- Vendedores.
- Resumos.
- Conversas.
- Blocos de dashboard.

Evitar transformar toda seção da interface em um card.

### Regras visuais

- bordas sutis;
- sombra discreta;
- espaçamento consistente;
- radius definido no `DESIGN.md`;
- hierarquia clara.

Evitar:

- sombras pesadas;
- excesso de radius;
- gradientes decorativos;
- cards dentro de cards sem necessidade.

---

# 21. Badges

Badges devem representar estados ou categorias curtas.

Exemplos:

- Novo.
- Usado.
- Publicado.
- Rascunho.
- Online.

Não utilizar badges para todas as informações disponíveis.

Estados não devem depender exclusivamente da cor.

---

# 22. Avatar

Usado para:

- usuário;
- vendedor;
- comprador;
- contexto do chat.

Deve possuir:

- fallback;
- `alt`;
- tamanho consistente;
- suporte a imagens ausentes.

---

# 23. Dialog, Drawer e Sheet

Usar:

### Dialog

Para ações ou informações que exigem foco.

### Drawer/Sheet

Para:

- filtros mobile;
- menus;
- painéis auxiliares.

### Regras

- foco deve ser gerenciado corretamente;
- teclado deve funcionar;
- fechamento deve ser previsível;
- conteúdo importante não deve ficar inacessível no mobile.

---

# 24. Loading

Usar:

- Skeleton para conteúdo estrutural.
- Spinner para ações pontuais.
- Loading state de botão para submissões.

Evitar usar spinner como substituto de toda a interface quando skeleton for mais adequado.

Exemplo:

```text
ProductList
├── ProductCardSkeleton
├── ProductCardSkeleton
├── ProductCardSkeleton
└── ProductCardSkeleton
```

---

# 25. Empty States

Todo fluxo de coleção deve considerar estado vazio.

Exemplos:

- Nenhum produto encontrado.
- Nenhum favorito.
- Nenhum anúncio.
- Nenhuma conversa.

Um empty state deve explicar:

1. O que aconteceu.
2. O que o usuário pode fazer.
3. Qual ação é recomendada, quando aplicável.

---

# 26. Error States

Erros devem ser compreensíveis e acionáveis.

Exemplo:

```text
Não foi possível carregar os anúncios.

Tente novamente.
```

Quando possível, oferecer ação de retry.

Não exibir detalhes técnicos para usuários finais.

---

# 27. Estados dos componentes

Componentes interativos devem considerar:

```text
default
hover
focus
active
disabled
loading
error
success
empty
```

Nem todos os componentes precisam implementar todos os estados, mas o conjunto relevante deve ser definido antes da implementação.

---

# 28. Responsividade

Todos os componentes devem ser projetados mobile-first.

Prioridades:

### Mobile

- conteúdo essencial;
- touch targets adequados;
- navegação simples;
- formulários confortáveis;
- drawers para filtros;
- uma conversa por vez no chat.

### Tablet

- aproveitamento de espaço;
- grids intermediários;
- navegação adaptada.

### Desktop

- grids maiores;
- múltiplas colunas;
- chat em layout de duas colunas quando apropriado;
- maior densidade de informação sem comprometer legibilidade.

---

# 29. Acessibilidade

Todos os componentes devem considerar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- `aria-label` quando necessário;
- `aria-describedby` para mensagens de erro/ajuda;
- contraste adequado;
- targets de toque próximos de 44x44px;
- `alt` significativo para imagens;
- estados que não dependam somente de cor;
- `prefers-reduced-motion`.

Componentes interativos não devem ser implementados apenas com `div` clicável quando um elemento semântico existir.

---

# 30. Ícones

Preferir biblioteca de ícones consistente.

Ícones:

- não devem substituir texto quando a ação não for evidente;
- devem possuir accessible label quando forem a única representação da ação;
- devem manter tamanho visual consistente;
- não devem ser usados como decoração excessiva.

Evitar emojis como substitutos de ícones da interface.

---

# 31. Motion

Animações devem ser discretas.

Usar motion para:

- feedback;
- transições de estado;
- abertura/fechamento;
- interação.

Evitar:

- animações constantes;
- efeitos chamativos;
- movimentos que dificultem leitura;
- transições longas.

Respeitar:

```css
prefers-reduced-motion
```

---

# 32. Microcopy

Os componentes devem utilizar português brasileiro.

Tom:

- claro;
- amigável;
- direto;
- humano;
- sem excesso de linguagem corporativa.

Exemplos:

```text
Publicar anúncio
Salvar alterações
Enviar mensagem
Tentar novamente
Nenhum anúncio encontrado
Você ainda não adicionou favoritos
```

---

# 33. Naming

Preferir nomes que representem a responsabilidade do componente.

Bons exemplos:

```text
ProductCard
ProductGallery
ProductFilters
ListingForm
ImageUploader
FavoriteButton
ConversationList
MessageComposer
SellerCard
```

Evitar:

```text
DataBox
GenericCard2
CustomThing
MainComponent
SuperContainer
```

Para arquivos:

```text
product-card.tsx
product-gallery.tsx
listing-form.tsx
favorite-button.tsx
```

---

# 34. Props

Props devem ser pequenas e explícitas.

Preferir:

```tsx
<ProductCard product={product} showFavorite />
```

Em vez de:

```tsx
<ProductCard data={data} config={config} options={options} />
```

Não passar objetos gigantes quando o componente utiliza apenas algumas propriedades.

Quando o domínio exigir um objeto completo, utilizar o tipo da feature correspondente.

---

# 35. Composição

Preferir composição para manter flexibilidade.

Exemplo:

```tsx
<Card>
  <CardHeader>...</CardHeader>

  <CardContent>...</CardContent>

  <CardFooter>...</CardFooter>
</Card>
```

Evitar componentes monolíticos com dezenas de props booleanas.

Quando houver muitas variações, avaliar:

- composição;
- variantes;
- subcomponentes;
- separação por contexto.

---

# 36. Server e Client Components

Por padrão:

```text
Server Component
    ↓
dados / composição
    ↓
Client Component
    ↓
interação
```

Usar Client Components quando houver:

- estado local;
- eventos de usuário;
- browser APIs;
- realtime;
- efeitos;
- hooks client-side.

Evitar marcar uma árvore inteira como `"use client"` sem necessidade.

---

# 37. Acesso a dados

Componentes visuais não devem acessar diretamente:

- Supabase;
- banco de dados;
- APIs internas;
- Storage.

Preferir:

```text
Component
    ↓
Hook / Server Action / Service
    ↓
Supabase
```

A camada apropriada deve cuidar de:

- autenticação;
- autorização;
- queries;
- mutations;
- tratamento de erro;
- transformação dos dados.

---

# 38. Testabilidade

Componentes importantes devem possuir testes isolados.

Prioridade:

1. componentes com lógica;
2. formulários;
3. estados de erro/loading;
4. componentes de interação;
5. componentes críticos do marketplace.

Testar comportamento, não implementação interna.

Exemplo:

```text
✓ botão de favorito muda de estado
✓ erro é exibido
✓ formulário impede submissão inválida
✓ usuário consegue enviar mensagem
```

Evitar testes excessivamente acoplados à estrutura interna do componente.

---

# 39. Performance

Boas práticas:

- evitar renders desnecessários;
- não fazer fetch dentro de componentes puramente visuais;
- otimizar imagens;
- utilizar Server Components quando apropriado;
- paginar listas;
- evitar listas gigantes sem necessidade;
- utilizar memoização somente quando houver benefício comprovado.

Não adicionar `memo`, `useMemo` ou `useCallback` indiscriminadamente.

---

# 40. Anti-patterns

Evitar:

- `components/` contendo toda a lógica da aplicação;
- componentes gigantes;
- componentes com muitas responsabilidades;
- acesso direto ao Supabase na UI;
- duplicação de primitives;
- abstrações genéricas sem necessidade;
- excesso de props booleanas;
- dependências circulares entre features;
- lógica de negócio em `components/ui`;
- uso excessivo de context;
- estados globais para estado local;
- CSS específico espalhado sem necessidade;
- componentes visualmente inconsistentes.

---

# 41. Checklist para novos componentes

Antes de criar:

- [ ] O componente realmente precisa existir?
- [ ] Ele é específico de uma feature?
- [ ] Existe algo semelhante já implementado?
- [ ] Deve ficar em `components/ui`, `components/layout` ou dentro da feature?
- [ ] Possui responsabilidade única?
- [ ] A API de props é simples?
- [ ] Possui estados necessários?
- [ ] É responsivo?
- [ ] É acessível?
- [ ] Possui tratamento de loading/error quando aplicável?
- [ ] Está alinhado ao `DESIGN.md`?
- [ ] Possui testes quando houver comportamento relevante?

---

# 42. Regra final

A regra principal do sistema de componentes do Ver-o-Preço é:

> **Componentes compartilhados devem ser genéricos; componentes de feature devem conhecer o domínio.**

A interface deve evoluir por composição:

```text
shadcn/ui
    ↓
components/ui
    ↓
components/layout
    ↓
feature components
    ↓
feature pages
```

Sem antecipar abstrações e sem concentrar regras de negócio em componentes visuais.

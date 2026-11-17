**Implementação da Landing Page Principal — Ver-o-Preço Marketplace**

Implemente a landing page principal do Ver-o-Preço Marketplace utilizando Next.js + TypeScript + Tailwind CSS + React, tomando como referência visual a imagem fornecida.

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
- componentes de Button / Card / Badge
- tokens
- biblioteca de ícones

reutilizar os recursos existentes.

Não introduzir bibliotecas novas sem necessidade.

Caso exista `DESIGN.md`, ele deve ser tratado como fonte de verdade visual.

### 2. Objetivo da página

A landing page deve apresentar o Ver-o-Preço Marketplace de forma clara, moderna e regional, convertendo visitantes em usuários (compradores e vendedores).

O usuário deve conseguir:

- entender rapidamente a proposta de valor (comprar e vender perto de você, sem taxas e sem burocracia);
- visualizar os diferenciais (taxa zero, privacidade, comércio de vizinhança);
- conhecer a tecnologia e os recursos principais;
- entender o fluxo simples de uso (do primeiro clique até a entrega);
- ver os polos regionais ativos no Pará;
- sentir segurança e confiança;
- ser direcionado para cadastro ou para explorar produtos.

A experiência deve transmitir:

- modernidade
- simplicidade
- confiança
- identidade paraense
- foco no comércio local
- segurança e privacidade
- ausência de taxas abusivas

### 3. Estrutura geral

A página deve possuir a seguinte estrutura:

```
LandingPage
│
├── Header
│   ├── BrandLogo
│   ├── BrandName
│   ├── Navigation
│   │   ├── NavLink (Início)
│   │   ├── NavLink (Como Funciona)
│   │   ├── NavLink (Experiência)
│   │   ├── NavLink (Segurança)
│   │   ├── NavLink (Polos no Pará)
│   │   └── NavLink (Suporte)
│   ├── LoginButton
│   └── PrimaryCTA (Anunciar produto)
│
├── HeroSection
│   ├── HeroContent
│   │   ├── Eyebrow
│   │   ├── Title
│   │   ├── Description
│   │   ├── PrimaryCTA
│   │   ├── SecondaryCTA
│   │   └── TrustBadges
│   └── HeroVisual
│       ├── PhoneMockup
│       └── ChatPreviewCard
│
├── PainPointsSection
│   ├── SectionHeader
│   └── PainPointCards (3 cards)
│
├── ValuePropositionSection
│   ├── SectionHeader
│   └── ValueCards (3 cards)
│
├── TechnologySection
│   ├── SectionHeader
│   ├── FeatureGrid (6 cards)
│   └── TechnologyBadge
│
├── HowItWorksSection
│   ├── SectionHeader
│   └── StepCards (4 steps)
│
├── SecuritySection
│   ├── SectionHeader
│   └── SecurityCards (3 cards)
│
├── RegionalPolesSection
│   ├── SectionHeader
│   └── PoleCards (6 polos)
│
├── FinalCTASection
│   ├── Title
│   ├── Description
│   ├── PrimaryCTA
│   └── TrustNote
│
└── Footer
    ├── Brand
    ├── LinkColumns
    └── Legal
```

### 4. Layout geral

**Desktop:**

- Container máximo aproximado: `1200px – 1320px`
- Padding horizontal generoso
- Seções com espaçamento vertical generoso (80px – 120px)
- Background global extremamente claro (`#F8F7FC` ou token equivalente)

**Mobile:**

- Tudo em coluna única
- Padding reduzido
- Hierarquia tipográfica reduzida progressivamente
- CTAs em largura total quando necessário

### 5. Background

Utilizar background extremamente claro com tonalidade lavanda/cinza:

```
#F8F7FC
```

ou o token equivalente do Design System.

Não utilizar branco puro como background global.

Cards principais devem utilizar branco (`#FFFFFF`).

### 6. Header

Altura aproximada: `72px – 80px`

Estrutura:

```
[Logo] Ver-o-Preço     Início  Como Funciona  Experiência  Segurança  Polos no Pará  Suporte     [Entrar]  [Anunciar produto]
```

Características:

- background branco
- borda inferior muito sutil
- sticky ou fixed com sombra sutil no scroll (opcional)
- navegação com hover e focus-visible
- botão primário roxo à direita
- botão secundário (Entrar) com estilo outline ou ghost

### 7. Hero Section

**Layout Desktop:**

```
┌────────────────────────────────────────────────────────────┐
│  Texto à esquerda                    Visual à direita      │
│  (título + descrição + CTAs)         (mockup + chat)       │
└────────────────────────────────────────────────────────────┘
```

**Eyebrow:**

```
Marketplace Regional do Pará • Comércio Seguro e Local
```

**Título principal:**

```
Compre e venda perto de você, sem taxas e sem burocracia.
```

- aproximadamente 40–48px desktop
- font-weight 700–800
- line-height apertado (~1.15)
- cor azul-marinho / roxo escuro

**Descrição:**
Texto explicando a proposta de valor (compra e venda local, chat integrado, etc.).

**CTAs:**

- Primário: `Quero anunciar` (roxo, ícone opcional)
- Secundário: `Explorar produtos` (outline ou ghost)

**Trust Badges (abaixo dos CTAs):**

```
[✓] Taxa Zero   [✓] 100% Seguro   [✓] Suporte Regional
```

**Hero Visual:**

- Mockup de celular mostrando a interface do app
- Card flutuante de chat (“Chat Seguro”) com mensagem de exemplo
- Elementos decorativos sutis (bolhas, gradientes)

### 8. Pain Points Section (“O comércio local ainda costuma ser complicado”)

**Título da seção:**

```
Vender e comprar localmente costumava ser complicado
```

Três cards em grid:

1. **Taxas abusivas de intermediação**
2. **Grupos e insegurança no WhatsApp**
3. **Filtros ineficientes para o Pará**

Cada card deve ter:

- ícone
- título
- descrição curta
- link sutil “Saiba mais” ou similar

### 9. Value Proposition Section

**Título:**

```
Uma praça digital moderna, justa e 100% focada no comércio local
```

Três cards de valor:

1. **Lucro 100% seu (Taxa Zero)**
2. **Privacidade preservada**
3. **Comércio de vizinhança**

Características:

- ícones com fundo colorido suave (verde, roxo, lavanda)
- tipografia clara
- espaçamento generoso

### 10. Technology Section (“Construído com tecnologia de classe mundial”)

**Header da seção:**

- Título + badge “Tecnologia Supabase + proteção de dados”

**Grid de 6 features:**

1. Catálogo Inteligente & Filtros Regionais
2. Chat com Criptografia
3. Publicação em 2 Minutos
4. Dashboard do vendedor
5. Termômetro & Selos Verificados
6. (sexto card conforme referência)

Cada card deve conter:

- ícone
- título
- descrição curta
- possível badge de status (“Disponível”, “Em breve”, etc.)

### 11. How It Works Section (“Simples do primeiro clique até a entrega”)

Quatro passos numerados:

1. **Crie sua conta em segundos**
2. **Anuncie o que não usa**
3. **Negocie pelo Chat Seguro**
4. **Combine a entrega presencial**

Características:

- numeração grande e colorida
- ícone ou ilustração por passo
- descrição clara e curta
- layout em linha no desktop e em coluna no mobile

### 12. Security Section (“Segurança de dados e negociações conscientes”)

Três cards:

1. **Autenticação com Supabase**
2. **Polos de Encontro Sugeridos**
3. **Escalação de Contato Preferência**

Cada card deve reforçar confiança sem linguagem técnica excessiva.

### 13. Regional Poles Section (“Polos conectados no Estado do Pará”)

**Título + subtítulo** sobre conexão entre municípios.

Grid de 6 polos:

- Belém
- Ananindeua
- Castanhal
- Marituba
- Santarém
- Marabá

Cada card de polo deve conter:

- nome do município
- status (Ativo / Em expansão)
- possível contagem de usuários ou produtos
- ícone ou badge de localização

### 14. Final CTA Section

Background escuro/roxo:

**Título:**

```
Pronto para fazer renda extra ou encontrar sua próxima oportunidade?
```

**Descrição** curta.

**CTA principal:**

```
Quero anunciar meu produto
```

**Nota de confiança:**

```
✓ Cadastro grátis  •  ✓ Sem taxa  •  ✓ Suporte regional
```

### 15. Footer

Estrutura em colunas:

- Logo + descrição curta
- Sobre a Ver-o-Preço
- Para Compradores
- Para Vendedores
- Polos e Suporte
- Links legais (Privacidade, Termos, etc.)

Copyright:

```
© 2026 Ver-o-Preço Marketplace Pará. Todos os direitos reservados.
```

### 16. Design Tokens (referência)

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
Dark CTA:          roxo escuro / quase preto
```

### 17. Tipografia

Hierarquia aproximada:

```
H1 (Hero):     40–48px / 700–800
H2 (Seções):   32–36px / 700
H3 (Cards):    18–20px / 600–700
Body:          15–16px / 400–500
Small:         13–14px / 500
```

### 18. Responsividade

**Desktop (≥ 1024px):**

- grids de 2, 3 ou 4 colunas conforme a seção
- hero em duas colunas

**Tablet:**

- reduzir gaps e paddings
- grids de 2 colunas quando possível

**Mobile (< 768px):**

- tudo em coluna única
- hero com visual abaixo do texto
- steps em coluna
- polos em 1 ou 2 colunas
- CTAs em largura total

### 19. Acessibilidade

- HTML semântico (`header`, `nav`, `main`, `section`, `footer`)
- labels e `aria-label` adequados
- contraste suficiente
- navegação por teclado
- focus-visible em todos os elementos interativos
- textos alternativos em imagens e mockups

### 20. Componentização sugerida

```
components/
└── landing/
    ├── header.tsx
    ├── hero-section.tsx
    ├── pain-points-section.tsx
    ├── value-proposition-section.tsx
    ├── technology-section.tsx
    ├── how-it-works-section.tsx
    ├── security-section.tsx
    ├── regional-poles-section.tsx
    ├── final-cta-section.tsx
    ├── footer.tsx
    └── shared/
        ├── section-header.tsx
        ├── feature-card.tsx
        ├── step-card.tsx
        └── pole-card.tsx
```

### 21. Instruções finais para o agente

Antes de implementar:

1. Analise a estrutura atual do projeto.
2. Identifique a versão do Next.js e a configuração do Tailwind.
3. Localize `DESIGN.md` e componentes existentes.
4. Reutilize ao máximo o Design System e componentes já criados.
5. Não sobrescreva configurações existentes sem necessidade.
6. Implemente de forma incremental (seção por seção).
7. Execute TypeScript/lint após a implementação.
8. Verifique responsividade em desktop, tablet e mobile.
9. Compare visualmente com a referência.
10. Ajuste espaçamentos, tipografia e proporções antes de considerar a tarefa concluída.

**Prioridades**

1. Fidelidade visual à referência
2. Responsividade
3. Acessibilidade
4. Componentização
5. Manutenibilidade
6. Performance
7. SEO básico (títulos, meta, headings semânticos)

Não adicionar funcionalidades ou elementos visuais que não estejam relacionados à landing page principal.

---

Este prompt está pronto para ser utilizado por um agente de implementação.

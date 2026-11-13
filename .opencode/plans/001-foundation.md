## 1. Objetivo

Estabelecer a base técnica do Ver-o-Preço antes da implementação das features de negócio.

Este plano prepara Next.js, React, TypeScript, Tailwind CSS, shadcn/ui e Supabase, além da estrutura feature-first, padrões de qualidade, ambiente, layout responsivo e infraestrutura compartilhada.

## 2. Escopo

- Inicializar/configurar o projeto Next.js.
- Configurar TypeScript em modo estrito.
- Configurar Tailwind CSS e shadcn/ui.
- Aplicar os tokens e princípios definidos em `DESIGN.md`.
- Configurar Supabase para Auth, Database, Storage e Realtime.
- Criar a estrutura base de `app`, `components`, `features`, `lib`, `config` e testes.
- Criar infraestrutura compartilhada de layout.
- Definir padrões de Server/Client Components.
- Configurar lint, testes, typecheck e build.
- Preparar variáveis de ambiente.
- Criar a base de documentação/migrations necessária para evolução.

## 3. Não-objetivos

- Implementar autenticação completa.
- Implementar CRUD de produtos/listagens.
- Implementar favoritos.
- Implementar chat.
- Criar regras de negócio específicas de marketplace.
- Implementar pagamentos, pedidos ou entregas.

## 4. Arquitetura

### Estrutura inicial

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── layout/
├── features/
│   ├── auth/
│   ├── profile/
│   ├── products/
│   ├── listings/
│   ├── favorites/
│   ├── chat/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── validations/
├── config/
├── hooks/
└── types/
```

Feature-specific hooks, schemas, services, types e testes devem permanecer dentro do módulo correspondente sempre que não forem compartilhados.

### Regras

- Server Components por padrão.
- Client Components somente quando interação/estado/browser APIs exigirem.
- `components/ui` contém primitives reutilizáveis.
- `components/layout` contém elementos realmente globais.
- Regras de negócio pertencem aos módulos.
- Não criar diretórios globais de `services`, `hooks` ou `utils` para código específico de feature.
- Dependências entre módulos devem respeitar os limites definidos em `docs/architecture/modules.md`.

## 5. Supabase

Preparar:

- Cliente browser.
- Cliente server.
- Middleware/session handling conforme arquitetura definida.
- Variáveis de ambiente.
- Estrutura inicial de migrations.
- Convenções de acesso ao banco.
- Base para RLS.
- Base para Storage.
- Base para Realtime.

Nenhum segredo privilegiado deve ser exposto no browser.

## 6. UI

Aplicar `DESIGN.md` como fonte visual de verdade:

- Amazon green como identidade primária.
- Açaí purple como identidade secundária.
- Superfícies neutras e quentes.
- Tipografia sans-serif.
- Espaçamento baseado na escala definida.
- Bordas e sombras sutis.
- Mobile-first.
- Estados de loading, empty, error e success.
- Foco visível e targets de toque adequados.

Criar apenas primitives e layout necessários nesta fase.

## 7. Estados

A fundação deve suportar:

- Loading global quando necessário.
- Error boundaries.
- Not-found.
- Estados de formulário.
- Estados de conexão/erro de infraestrutura.
- Skeletons reutilizáveis.
- Empty state reutilizável.

## 8. Segurança

- Nunca commitar secrets.
- Validar variáveis obrigatórias no ambiente.
- Separar cliente server/browser.
- Não confiar em autorização feita apenas pela UI.
- Preparar RLS desde o início.
- Sanitizar/validar entradas nas boundaries.
- Evitar exposição desnecessária de dados.

## 9. Testes

Criar infraestrutura para:

- Unit tests.
- Component tests.
- Integration tests.
- E2E posteriormente.

Validar nesta fase:

- Typecheck.
- Lint.
- Build.
- Renderização das páginas base.
- Componentes fundamentais.
- Configuração do Supabase sem credenciais reais no código.

## 10. Critérios de aceitação

- [ ] Projeto executa localmente.
- [ ] TypeScript passa sem erros.
- [ ] Lint passa.
- [ ] Build passa.
- [ ] Tailwind/shadcn estão funcionais.
- [ ] Tokens básicos do `DESIGN.md` estão representados.
- [ ] Estrutura feature-first criada.
- [ ] Supabase client/server base configurados.
- [ ] Variáveis de ambiente documentadas.
- [ ] Layout responsivo base funciona em mobile e desktop.
- [ ] Nenhum segredo está versionado.
- [ ] Base de testes está funcional.
- [ ] Arquitetura está alinhada com `docs/architecture/*`.

## 11. Ordem de implementação

1. Bootstrap/configuração.
2. Dependências.
3. Estrutura de diretórios.
4. Design system base.
5. Layout.
6. Supabase.
7. Qualidade/testes.
8. Validação final.

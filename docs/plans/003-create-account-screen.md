# Plano 003 — Tela de Criação de Conta

## Objetivo

Implementar a tela de criação de conta do Ver-o-Preço com fidelidade à referência
visual, reutilizando o Design System, a autenticação existente (Supabase +
Server Actions) e a arquitetura feature-first.

## Escopo

- Card de cadastro com:
  - Nome completo;
  - E-mail;
  - Município do Pará;
  - Senha e confirmação;
  - Indicador em tempo real dos requisitos de senha;
  - Aceite obrigatório dos Termos de Uso e da Política de Privacidade;
  - Consentimento opcional para novidades e ofertas;
  - CTA de criação de conta;
  - Rodapé com link para entrar.
- Painel institucional com introdução, estatísticas, benefícios e aviso de
  privacidade.
- Footer global da tela.
- Layout responsivo, acessível e composto por componentes reutilizáveis.

## Não escopo

- Cadastro social (Google, Gov.br ou link mágico). Os blocos existentes foram
  removidos da UI; a integração poderá ser reintroduzida quando estiver
  configurada no Supabase.
- Criar as páginas `/termos`, `/privacidade` ou `/suporte`. Os links apontam
  para os destinos definidos e passarão a resolver quando esses módulos forem
  implementados.
- Alterar RLS, persistência de sessão ou o fluxo de login existente.
- Implementar o restante do marketplace.

## Arquitetura

- `src/app/(auth)/register/page.tsx` compõe a tela usando componentes da
  feature `auth`.
- `src/features/auth/components/create-account/` agrupa os componentes
  específicos do cadastro.
- Dados de domínio (municípios do Pará e conteúdo institucional) ficam em
  `src/features/auth/data/`.
- A validação é compartilhada entre cliente e servidor por
  `validateRegisterForm`.
- `registerAction` continua sendo a única fronteira com o Supabase Auth.

## Modelo de dados

`RegisterInput` passa a conter:

```ts
{
  name: string
  email: string
  municipality: string
  password: string
  termsAccepted: boolean
  marketingOptIn: boolean
}
```

Os metadados enviados ao Supabase Auth incluem `display_name`, `municipality`,
`marketing_opt_in`, `terms_accepted_at` e `terms_version`.

## Regras de validação

- Nome obrigatório, entre 2 e 80 caracteres.
- E-mail obrigatório e válido.
- Município obrigatório e pertencente à lista oficial do Pará.
- Senha com no mínimo 8 e no máximo 72 caracteres.
- Senha com pelo menos um número ou símbolo.
- Confirmação idêntica à senha.
- Aceite dos termos obrigatório.
- Consentimento de marketing opcional.

## Estados

- Formulário: idle, loading, error e success.
- Senha: oculta/visível.
- Requisitos de senha: pendente/atendido em tempo real.
- Erros inline por campo, com `aria-invalid` e `aria-describedby`.

## Acessibilidade

- HTML semântico com `header`, `main`, `section`, `form` e `footer`.
- Labels explícitos em todos os campos.
- Select nativo do município com label e mensagem de erro associada.
- Checkboxes nativos, com labels clicáveis e links legais acessíveis.
- Foco visível em todos os controles e alvos de toque de pelo menos 44px.
- Botão de mostrar/ocultar senha com `aria-label` dinâmico.
- Estados de carregamento com `aria-busy`.
- Ícones decorativos com `aria-hidden`.

## Testes

- Schema: município ausente/inválido, termos não aceitos e senha sem número ou
  símbolo.
- Formulário: campos renderizados, validação inline, envio de município/termos,
  requisitos de senha e estado de sucesso.

## Critérios de aceite

- A rota `/register` renderiza o layout completo em desktop e mobile.
- Em viewports a partir de `lg`, o card e o painel institucional ficam lado a
  lado; abaixo disso, empilhados.
- O cadastro por e-mail/senha continua funcional com validação no cliente e no
  servidor.
- Todos os controles são acessíveis por teclado.
- `bun run typecheck`, `bun run lint` e `bun run test` passam.

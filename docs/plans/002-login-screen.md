# Plano 002 — Tela de Login

## Objetivo

Implementar a tela de login do Ver-o-Preço com fidelidade visual à referência,
mantendo a autenticação existente (Supabase + Server Actions), a arquitetura
feature-first e os tokens do `DESIGN.md`.

## Escopo

- Header de autenticação com marca, selo SSL e retorno à home.
- Card de login com e-mail, senha, lembrar de mim, CTA, separador, login social
  (Google/Gov.br) e rodapé de cadastro.
- Card institucional com diferenciais do marketplace e estatísticas da rede.
- Footer global da tela.
- Layout responsivo, acessível e composto por componentes reutilizáveis.

## Não escopo

- Implementar OAuth real de Google/Gov.br.
- Criar novas rotas de catálogo, cadastro, privacidade, termos ou suporte. Os
  links usam os destinos definidos no design (`/catalogo`, `/cadastro`,
  `/privacidade`, `/termos`, `/suporte`) e passarão a resolver quando esses
  módulos forem implementados.
- Alterar as regras de autenticação, RLS ou persistência de sessão.
- Implementar o restante do marketplace.

## Arquitetura

- `src/app/(auth)/layout.tsx` fornece o chrome exclusivo das telas de entrada.
- `src/app/(public)/layout.tsx` mantém o `MainHeader` nas páginas públicas.
- `src/app/(dashboard)/layout.tsx` mantém o `MainHeader` na área autenticada.
- Componentes da tela vivem em `src/features/auth/components/`.
- Conteúdo institucional (features, cidades e links) fica em
  `src/features/auth/data/login-content.ts`.
- A autenticação com e-mail/senha continua usando `LoginForm` + `loginAction`.
- O login social usa um handler isolado que devolve indisponibilidade
  explícita; nenhuma sessão falsa é criada.

## Estados

- Login: idle, loading, error, success (redirecionamento).
- Senha: oculta/visível.
- Lembrar de mim: controlado.
- Login social: idle, loading, disabled e mensagem de indisponibilidade.

## Acessibilidade

- Labels explícitos, `aria-invalid` e `aria-describedby`.
- Botão de mostrar/ocultar senha com `aria-label` dinâmico.
- Foco visível em links, botões e checkbox.
- Estados de carregamento com `aria-busy`.
- Ícones decorativos com `aria-hidden`.
- Estrutura semântica com `header`, `main`, `section`, `footer`.

## Testes

- Atualizar o teste do `LoginForm` para o novo CTA.
- Cobrir mostrar/ocultar senha e o checkbox controlado.
- Cobrir o handler de login social sem sessão falsa.
- Manter os testes de schemas e rotas existentes.

## Critérios de aceite

- A rota `/login` renderiza o layout completo em desktop e mobile.
- O login por e-mail/senha continua funcional com validação no cliente e no
  servidor.
- Todos os controles são acessíveis por teclado.
- `bun run typecheck`, `bun run lint` e `bun run test` passam.

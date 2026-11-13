# Plano 002 — Autenticação

## Objetivo

Implementar autenticação e gerenciamento de sessão usando Supabase Auth, preparando o acesso público ao marketplace e as áreas protegidas.

## Status

Implementado.

## Escopo

- Cadastro.
- Login.
- Logout.
- Recuperação de senha.
- Redefinição de senha.
- Persistência de sessão.
- Proteção de rotas.
- Redirecionamentos.
- Feedback de autenticação.
- Estados de loading/error/success.
- Base para criação do perfil após cadastro.

## Arquitetura

Módulo `src/features/auth/` seguindo a estrutura feature-first:

```text
features/auth/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── tests/
```

Responsabilidades:

- `components`: formulários e UI de autenticação (login, cadastro, recuperação, redefinição, etc.).
- `schemas`: validação de credenciais com regras em português.
- `services`: chamadas relacionadas ao Supabase Auth (server-side) e sessão.
- `utils`: helpers de autenticação, rotas, redirecionamentos e erros.
- `tests`: testes do módulo.

## Implementado

- **Schemas/validação**: `validateLoginForm`, `validateRegisterForm`, `validateForgotPasswordForm`, `validateResetPasswordForm` com regras de senha, município do Pará, aceite de termos.
- **Serviços Auth**: `signInWithPassword`, `signUpWithPassword`, `requestPasswordReset`, `updatePassword`, `signOut`, `exchangeCodeForSession` com normalização de erros.
- **Sessão**: `getCurrentUser`, `redirectIfAuthenticated`, `requireUser` via `createClient` do Supabase SSR, com `cache()` para deduplicação.
- **Rotas/App**: Rotas em `(auth)/*` (login, register, forgot-password, reset-password, access-recovery) e `auth/callback/route.ts` para troca de código PKCE.
- **Proteção/Redirecionamentos**: `proxy.ts` (Next.js) renovando sessão e aplicando regras com `getAuthRedirectTarget`; rotas protegidas por prefixo `/dashboard`, rotas de autenticação redirecionam usuário autenticado para `/dashboard` exceto `/reset-password`.
- **Server Actions**: `loginAction`, `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `logoutAction`.
- **UI/Componentes**: Telas e formulários de auth com estados de loading/error/success, acessibilidade e layout mobile-first.
- **Testes**: Schemas, rotas/redirecionamentos/notificações, erros de auth cobertos. Todos os testes passam.

## Variáveis de ambiente

Utilizadas conforme `.env.example`/`.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (opcional, fallback para host da requisição)

## Critérios de aceitação

- [x] Usuário consegue criar conta.
- [x] Usuário consegue entrar.
- [x] Usuário consegue sair.
- [x] Usuário consegue solicitar recuperação.
- [x] Usuário consegue redefinir senha.
- [x] Rotas protegidas não ficam acessíveis sem sessão.
- [x] Usuário autenticado não recebe fluxo de login desnecessariamente.
- [x] Estados de erro/loading funcionam.
- [x] Typecheck/lint/test/build passam.
- [x] Nenhum segredo é exposto.
- [x] Fluxos funcionam em mobile e desktop.

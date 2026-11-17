## 1. Objetivo

Implementar autenticação e gerenciamento de sessão usando Supabase Auth, preparando o acesso público ao marketplace e as áreas protegidas.

## 2. Escopo

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

## 3. Não-objetivos

- CRUD completo de perfil.
- Publicação de produtos.
- Chat.
- Favoritos.
- OAuth, caso não esteja explicitamente definido no escopo atual.
- Controle administrativo.

## 4. Arquitetura

Módulo:

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

- `components`: formulários e UI de autenticação.
- `schemas`: validação de credenciais.
- `services`: chamadas relacionadas ao Supabase Auth.
- `hooks`: somente comportamento específico de autenticação no client.
- `utils`: helpers de autenticação.
- `tests`: testes do módulo.

## 5. Fluxos

### Cadastro

1. Usuário abre cadastro.
2. Preenche dados obrigatórios.
3. Validação client-side.
4. Submissão.
5. Supabase Auth cria usuário.
6. Fluxo de sessão é atualizado.
7. Perfil pode ser inicializado conforme estratégia definida em `supabase.md`.
8. Usuário é direcionado para a área apropriada.

### Login

1. Usuário informa credenciais.
2. Validação.
3. Supabase Auth autentica.
4. Sessão é estabelecida.
5. Redirecionamento para destino apropriado.

### Logout

1. Usuário solicita saída.
2. Sessão é encerrada.
3. Estado autenticado é invalidado.
4. Usuário retorna ao contexto público.

### Recuperação

- Solicitar recuperação.
- Receber fluxo de reset.
- Definir nova senha.
- Invalidar/atualizar sessão conforme comportamento do Supabase.

## 6. Modelo de dados

O usuário de autenticação é gerenciado por Supabase Auth.

O módulo não deve duplicar credenciais em tabelas próprias.

Dados de perfil pertencem ao módulo `profile`.

## 7. UI

Páginas/fluxos:

- Login.
- Cadastro.
- Esqueci minha senha.
- Redefinir senha.

Requisitos:

- Labels explícitos.
- Mensagens em português.
- Validação inline.
- Botão com estado de loading.
- Erros compreensíveis.
- Foco acessível.
- Layout mobile-first.
- Identidade visual conforme `DESIGN.md`.

## 8. Estados

Cada formulário deve suportar:

- Idle.
- Editing.
- Submitting.
- Success.
- Validation error.
- Authentication error.
- Network/infrastructure error.

Não apagar dados preenchidos desnecessariamente após erro.

## 9. Segurança

- Nunca armazenar senha manualmente.
- Usar Supabase Auth.
- Nunca confiar em estado de autenticação somente no client.
- Proteger rotas no servidor/middleware conforme arquitetura.
- Validar sessão antes de operações protegidas.
- Não expor tokens em logs.
- Não revelar informações sensíveis em mensagens de erro.

## 10. Testes

- Schema validation.
- Login válido/inválido.
- Cadastro válido/inválido.
- Logout.
- Recuperação de senha.
- Estados de loading/error.
- Proteção de rota.
- Redirecionamento.
- Sessão persistente.
- Acessibilidade dos formulários.

## 11. Critérios de aceitação

- [ ] Usuário consegue criar conta.
- [ ] Usuário consegue entrar.
- [ ] Usuário consegue sair.
- [ ] Usuário consegue solicitar recuperação.
- [ ] Usuário consegue redefinir senha.
- [ ] Rotas protegidas não ficam acessíveis sem sessão.
- [ ] Usuário autenticado não recebe fluxo de login desnecessariamente.
- [ ] Estados de erro/loading funcionam.
- [ ] Typecheck/lint/test/build passam.
- [ ] Nenhum segredo é exposto.
- [ ] Fluxos funcionam em mobile e desktop.

## 12. Dependências

- `001-foundation`
- Supabase Auth configurado.
- Base de layout disponível.

## 13. Ordem de implementação

1. Schemas.
2. Services Auth.
3. Session handling.
4. Form components.
5. Routes/pages.
6. Protection/redirects.
7. Tests.
8. Accessibility/security review.

---

## 14. Registro de execução

Status: Implementado.

### Implementado

- **Schemas/validação**: `validateLoginForm`, `validateRegisterForm`, `validateForgotPasswordForm`, `validateResetPasswordForm` com regras de senha, município do Pará, aceite de termos.
- **Serviços Auth**: `signInWithPassword`, `signUpWithPassword`, `requestPasswordReset`, `updatePassword`, `signOut`, `exchangeCodeForSession` com normalização de erros.
- **Sessão**: `getCurrentUser`, `redirectIfAuthenticated`, `requireUser` via `createClient` do Supabase SSR, com `cache()` para deduplicação.
- **Rotas/App**: Rotas em `(auth)/*` (login, register, forgot-password, reset-password, access-recovery) e `auth/callback/route.ts` para troca de código PKCE.
- **Proteção/Redirecionamentos**: `proxy.ts` (Next.js) renovando sessão e aplicando regras com `getAuthRedirectTarget`; rotas protegidas por prefixo `/dashboard`, rotas de autenticação redirecionam usuário autenticado para `/dashboard` exceto `/reset-password`.
- **Server Actions**: `loginAction`, `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `logoutAction`.
- **UI/Componentes**: Telas e formulários de auth com estados de loading/error/success, acessibilidade e layout mobile-first.
- **Testes**: Schemas, rotas/redirecionamentos/notificações, erros de auth cobertos. Todos os testes passam.

### Variáveis de ambiente

Utilizadas conforme `.env.example`/`.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (alias legada; `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` é a forma preferida — defina apenas uma)
- `NEXT_PUBLIC_SITE_URL` (opcional, fallback para host da requisição)

### Critérios de aceitação (verificados na execução)

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

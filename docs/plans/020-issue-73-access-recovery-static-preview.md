## 1. Objetivo

Transformar `/access-recovery` em uma tela **explicitamente estática** de explicação/prévia do fluxo de recuperação, eliminando mutações simuladas, controles sem efeito e CTA sem handler. As regras de senha exibidas passam a vir exclusivamente de `auth.schemas.ts`. Issue-pai #70, Fase 01 — Foundation & correctness.

## 2. Decisão de produto (registrada)

A intenção da rota foi decidida com o usuário: ela é uma **prévia informativa**, não um segundo fluxo de recuperação. Os fluxos reais já existem e são testados em `/forgot-password` (`ForgotPasswordForm` + `forgotPasswordAction`) e `/reset-password` (`ResetPasswordForm` + `resetPasswordAction`, com sessão temporária do link). Duplicar Server Actions nesta tela criaria dois caminhos para a mesma operação e o card da "próxima etapa" não poderia redefinir a senha sem o token do e-mail.

## 3. Estado atual (diagnóstico)

- `recovery-step-card.tsx`: `"use client"`, `email`, `isSubmitting` e `sent` locais; `handleSubmit` usa `setTimeout(600)` e nunca chama ação; o texto do botão muda para "Link enviado" sem envio real.
- `next-step-preview-card.tsx`: `"use client"`, quatro estados locais para campos/olhos/switch; inputs de nova senha e confirmação, `PasswordStrength`, `DisconnectDevicesSwitch` e um `<Button>` `Redefinir senha e entrar` **sem `onClick`, sem `type` e sem link**.
- `password-strength.tsx`: regras próprias (`>=8`, maiúscula, dígito, especial) divergentes de `PASSWORD_REQUIREMENTS` (`>=8`, número **ou** símbolo) e de `PASSWORD_MAX_LENGTH` (72).
- `disconnect-devices-switch.tsx`: controle interativo sem efeito; único consumidor é o card de prévia.
- A rota não está em `AUTH_PATH_PREFIXES`, então não há redirect de sessão a considerar. `HelpCard` e `SecurityTipCard` já são estáticos e permanecem.

## 4. Escopo aprovado

- `src/features/auth/components/access-recovery/recovery-step-card.tsx`: tornar Server Component (remover `"use client"`, estados, `form` e `setTimeout`). Manter badges, título, parágrafo, aviso de token de 15 min, link para `/login` e selo "Proteção Total Ver-o-Preço". Substituir o `<form>` por uma representação estática do campo de e-mail (sem `<input>`) e tornar o CTA real com `<Button asChild><Link href="/forgot-password">`.
- `src/features/auth/components/access-recovery/next-step-preview-card.tsx`: tornar Server Component; remover inputs, botões de mostrar/ocultar, check de coincidência, switch e o `<Button>` sem handler. Renderizar as regras a partir de `PASSWORD_REQUIREMENTS.map((requirement) => requirement.label)` e `PASSWORD_MAX_LENGTH`, e oferecer link real para `/reset-password` para quem já recebeu o e-mail. Manter badges, título, explicação, grid responsivo e tokens visuais.
- Remover `password-strength.tsx` e `disconnect-devices-switch.tsx`: ficam sem consumidor após a mudança e são, respectivamente, a fonte das regras divergentes e um controle falso. O primitivo genérico `src/components/ui/switch.tsx` **não** é alterado.
- `src/app/(auth)/access-recovery/page.tsx` e `access-recovery-page.tsx`: inalterados (metadata, layout, `HelpCard`, `SecurityTipCard`).

## 5. Não-objetivos

- Criar ou modificar Server Actions, schemas de validação, policies/RLS, migrations, dependências ou variáveis de ambiente.
- Mover/renomear componentes compartilhados de outras telas (ex.: `create-account/password-requirements.tsx`, usado apenas no cadastro com estado ao vivo).
- Alterar `forgot-password`, `reset-password`, `login`, `register` ou o proxy de autenticação.
- Commit, push, PR, merge ou fechamento de issue sem revisão e aprovação explícitas.

## 6. Critérios de aceite (BDD)

- **Dado** o card da etapa 1, **quando** a tela é renderizada, **então** não há `<form>`, `<input>`, estado `sent` nem `setTimeout`; o CTA é um link real para `/forgot-password`.
- **Dado** o card da próxima etapa, **quando** a tela é renderizada, **então** não há botões sem handler, switches ou campos de senha; o único CTA é um link real para `/reset-password`.
- **Dado** as regras exibidas, **quando** a prévia é renderizada, **então** os rótulos vêm de `PASSWORD_REQUIREMENTS` e o limite de `PASSWORD_MAX_LENGTH`, sem regras locais duplicadas.
- **Dado** um leitor de tela, **quando** percorre a página, **então** os cards continuam semanticamente rotulados e o exemplo de e-mail é texto, não um campo editável enganoso.
- **Dado** a suíte existente, **quando** ela roda, **então** todos os testes de auth e demais features continuam passando.

## 7. Seams de teste (TDD)

1. `src/features/auth/tests/access-recovery-page.test.tsx`: renderizar `AccessRecoveryPage` diretamente (Server Component sem `async`). Verificar ausência de `form`/`input`/`switch`/`button`, `href`s reais (`/forgot-password`, `/reset-password`, `/login`), rótulos presentes para cada item de `PASSWORD_REQUIREMENTS` e o limite de `PASSWORD_MAX_LENGTH`, além da copy que identifica a tela como prévia.
2. Nenhum mock de Supabase, Server Action ou router: a tela não possui mais nenhuma dessas dependências. Se um mock for necessário, isso indica que uma mutação ou dependência indevida voltou ao componente.

Ciclo vermelho → verde com o teste da página primeiro. Títulos de teste em inglês; copy da UI permanece pt-BR.

## 8. Skills e MCPs utilizados

- `tdd` — teste da página antes da implementação, com fatia única.
- Documentação local do Next.js 16.4.6 (`01-app/03-api-reference/02-components/link.md`) — conferir o uso de `Link`, especialmente com `<Button asChild>`, antes de escrever o JSX.
- Context7 — não necessário: a regra do repositório aponta a documentação local versionada como fonte para Next.js.
- MCP do Supabase — não utilizado: nenhuma mudança de schema, RLS, policy, dado ou config de projeto.

## 9. Validação

`bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`, mais revisão com os agentes `architect`, `reviewer` e `security-reviewer` (este último pela ausência confirmada de mutações e superfície de autenticação).

/**
 * Tipos de domínio do módulo de autenticação.
 *
 * Nenhum tipo do Supabase é exposto para componentes de UI: apenas os dados
 * necessários para a aplicação.
 */

export type AuthField =
  | "name"
  | "email"
  | "municipality"
  | "password"
  | "passwordConfirmation"
  | "termsAccepted";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type AuthUser = {
  id: string;
  email: string | null;
};

/**
 * Falha normalizada de autenticação.
 *
 * Mantém apenas `code`, `status` e `message` para permitir o mapeamento
 * seguro de erros. A mensagem original nunca é exibida ao usuário.
 */
export type AuthFailure = {
  code?: string;
  message: string;
  status?: number;
};

export type AuthActionStatus = "idle" | "error" | "success";

export type AuthActionState = {
  status: AuthActionStatus;
  message?: string;
  fieldErrors?: AuthFieldErrors;
  email?: string;
};

export const initialAuthState: AuthActionState = { status: "idle" };

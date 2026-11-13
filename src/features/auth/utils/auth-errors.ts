import type { AuthFailure } from "../types/auth.types";

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "E-mail ou senha incorretos.",
  emailNotConfirmed:
    "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  emailAlreadyExists:
    "Já existe uma conta com este e-mail. Tente entrar ou recuperar sua senha.",
  weakPassword: "Escolha uma senha mais forte.",
  samePassword: "A nova senha precisa ser diferente da senha atual.",
  rateLimit:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  expiredSession: "Sua sessão expirou. Entre novamente.",
  expiredLink: "O link é inválido ou expirou. Solicite um novo.",
  signupDisabled: "O cadastro está temporariamente indisponível.",
  invalidEmail: "Informe um e-mail válido.",
  network:
    "Não foi possível conectar. Verifique sua internet e tente novamente.",
  serviceUnavailable:
    "O serviço de autenticação está indisponível no momento. Tente novamente mais tarde.",
  generic: "Não foi possível concluir a operação. Tente novamente.",
} as const;

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: AUTH_ERROR_MESSAGES.invalidCredentials,
  invalid_grant: AUTH_ERROR_MESSAGES.invalidCredentials,
  email_not_confirmed: AUTH_ERROR_MESSAGES.emailNotConfirmed,
  user_already_exists: AUTH_ERROR_MESSAGES.emailAlreadyExists,
  email_exists: AUTH_ERROR_MESSAGES.emailAlreadyExists,
  weak_password: AUTH_ERROR_MESSAGES.weakPassword,
  same_password: AUTH_ERROR_MESSAGES.samePassword,
  over_email_send_rate_limit: AUTH_ERROR_MESSAGES.rateLimit,
  over_request_rate_limit: AUTH_ERROR_MESSAGES.rateLimit,
  over_sms_send_rate_limit: AUTH_ERROR_MESSAGES.rateLimit,
  session_not_found: AUTH_ERROR_MESSAGES.expiredSession,
  refresh_token_not_found: AUTH_ERROR_MESSAGES.expiredSession,
  otp_expired: AUTH_ERROR_MESSAGES.expiredLink,
  flow_state_expired: AUTH_ERROR_MESSAGES.expiredLink,
  signup_disabled: AUTH_ERROR_MESSAGES.signupDisabled,
  email_address_invalid: AUTH_ERROR_MESSAGES.invalidEmail,
  email_address_not_authorized: AUTH_ERROR_MESSAGES.invalidEmail,
  validation_failed: AUTH_ERROR_MESSAGES.invalidEmail,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toAuthFailure(error: unknown): AuthFailure {
  if (isRecord(error)) {
    return {
      code: typeof error.code === "string" ? error.code : undefined,
      message: typeof error.message === "string" ? error.message : "",
      status: typeof error.status === "number" ? error.status : undefined,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "" };
}

function matchesMessage(message: string, patterns: string[]): boolean {
  const normalized = message.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function mapAuthError(failure: AuthFailure): string {
  if (failure.code && CODE_MESSAGES[failure.code]) {
    return CODE_MESSAGES[failure.code];
  }

  const message = failure.message.trim();

  if (!message) {
    return AUTH_ERROR_MESSAGES.generic;
  }

  if (
    matchesMessage(message, [
      "fetch failed",
      "failed to fetch",
      "networkerror",
      "network error",
      "timeout",
      "etimedout",
      "econnrefused",
    ])
  ) {
    return AUTH_ERROR_MESSAGES.network;
  }

  if (matchesMessage(message, ["missing supabase environment variables"])) {
    return AUTH_ERROR_MESSAGES.serviceUnavailable;
  }

  if (matchesMessage(message, ["invalid login credentials"])) {
    return AUTH_ERROR_MESSAGES.invalidCredentials;
  }

  if (matchesMessage(message, ["email not confirmed"])) {
    return AUTH_ERROR_MESSAGES.emailNotConfirmed;
  }

  if (matchesMessage(message, ["already registered", "already exists"])) {
    return AUTH_ERROR_MESSAGES.emailAlreadyExists;
  }

  if (matchesMessage(message, ["password should be at least"])) {
    return AUTH_ERROR_MESSAGES.weakPassword;
  }

  if (matchesMessage(message, ["should be different from the old password"])) {
    return AUTH_ERROR_MESSAGES.samePassword;
  }

  if (matchesMessage(message, ["rate limit", "too many requests"])) {
    return AUTH_ERROR_MESSAGES.rateLimit;
  }

  if (matchesMessage(message, ["auth session missing", "session expired"])) {
    return AUTH_ERROR_MESSAGES.expiredSession;
  }

  return AUTH_ERROR_MESSAGES.generic;
}

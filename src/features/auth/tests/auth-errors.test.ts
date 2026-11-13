import { describe, expect, it } from "vitest";

import {
  AUTH_ERROR_MESSAGES,
  mapAuthError,
  toAuthFailure,
} from "../utils/auth-errors";

describe("auth errors", () => {
  it("mapeia credenciais inválidas pelo código", () => {
    expect(
      mapAuthError({ code: "invalid_credentials", message: "Invalid login" })
    ).toBe(AUTH_ERROR_MESSAGES.invalidCredentials);
  });

  it("mapeia e-mail não confirmado", () => {
    expect(
      mapAuthError({ code: "email_not_confirmed", message: "Email not confirmed" })
    ).toBe(AUTH_ERROR_MESSAGES.emailNotConfirmed);
  });

  it("mapeia limite de tentativas", () => {
    expect(
      mapAuthError({
        code: "over_email_send_rate_limit",
        message: "Email rate limit exceeded",
      })
    ).toBe(AUTH_ERROR_MESSAGES.rateLimit);
  });

  it("reconhece falha de rede sem expor detalhes técnicos", () => {
    const message = mapAuthError({ message: "TypeError: fetch failed" });

    expect(message).toBe(AUTH_ERROR_MESSAGES.network);
    expect(message).not.toContain("fetch");
  });

  it("reconhece configuração ausente do Supabase", () => {
    expect(
      mapAuthError({ message: "Missing Supabase environment variables" })
    ).toBe(AUTH_ERROR_MESSAGES.serviceUnavailable);
  });

  it("usa mensagem genérica e não vaza a mensagem original", () => {
    const message = mapAuthError({
      message: "duplicate key value violates unique constraint profiles_pkey",
    });

    expect(message).toBe(AUTH_ERROR_MESSAGES.generic);
    expect(message).not.toContain("profiles_pkey");
  });

  it("normaliza erros do Supabase em um objeto simples", () => {
    const failure = toAuthFailure({
      code: "invalid_credentials",
      message: "Invalid login credentials",
      status: 400,
    });

    expect(failure).toEqual({
      code: "invalid_credentials",
      message: "Invalid login credentials",
      status: 400,
    });
  });

  it("normaliza erros inesperados", () => {
    expect(toAuthFailure(new Error("boom"))).toEqual({ message: "boom" });
    expect(toAuthFailure(undefined)).toEqual({ message: "" });
  });
});

import { describe, expect, it } from "vitest";

import {
  PASSWORD_MIN_LENGTH,
  validateForgotPasswordForm,
  validateLoginForm,
  validateRegisterForm,
  validateResetPasswordForm,
} from "../schemas/auth.schemas";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("auth schemas", () => {
  describe("validateLoginForm", () => {
    it("exige e-mail e senha", () => {
      const result = validateLoginForm(buildFormData({}));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.email).toBe("Informe seu e-mail.");
        expect(result.errors.password).toBe("Informe sua senha.");
      }
    });

    it("rejeita e-mail inválido", () => {
      const result = validateLoginForm(
        buildFormData({ email: "sem-arroba", password: "12345678" })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.email).toBe("Informe um e-mail válido.");
      }
    });

    it("normaliza o e-mail informado", () => {
      const result = validateLoginForm(
        buildFormData({ email: "  Pessoa@Exemplo.COM ", password: "segredo" })
      );

      expect(result).toEqual({
        ok: true,
        data: { email: "pessoa@exemplo.com", password: "segredo" },
      });
    });
  });

  describe("validateRegisterForm", () => {
    it("valida nome, senha e confirmação", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: " ",
          email: "pessoa@exemplo.com",
          password: "123",
          passwordConfirmation: "456",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.name).toBe("Informe seu nome.");
        expect(result.errors.password).toBe(
          `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`
        );
        expect(result.errors.passwordConfirmation).toBe(
          "As senhas não coincidem."
        );
      }
    });

    it("exige um município do Pará", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          password: "senha-segura",
          passwordConfirmation: "senha-segura",
          termsAccepted: "on",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.municipality).toBe("Selecione seu município.");
      }
    });

    it("rejeita municípios fora do Pará", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          municipality: "São Paulo",
          password: "senha-segura",
          passwordConfirmation: "senha-segura",
          termsAccepted: "on",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.municipality).toBe(
          "Selecione um município do Pará."
        );
      }
    });

    it("exige aceite dos termos", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          municipality: "Belém",
          password: "senha-segura",
          passwordConfirmation: "senha-segura",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.termsAccepted).toBe(
          "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
        );
      }
    });

    it("exige número ou símbolo na senha", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: "Maria Silva",
          email: "maria@exemplo.com",
          municipality: "Belém",
          password: "senhasegura",
          passwordConfirmation: "senhasegura",
          termsAccepted: "on",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.password).toBe(
          "A senha deve conter pelo menos um número ou símbolo."
        );
      }
    });

    it("aceita dados válidos", () => {
      const result = validateRegisterForm(
        buildFormData({
          name: "  Maria Silva ",
          email: "Maria@Exemplo.com",
          municipality: "Belém",
          password: "senha-segura",
          passwordConfirmation: "senha-segura",
          termsAccepted: "on",
          marketingOptIn: "on",
        })
      );

      expect(result).toEqual({
        ok: true,
        data: {
          name: "Maria Silva",
          email: "maria@exemplo.com",
          municipality: "Belém",
          password: "senha-segura",
          termsAccepted: true,
          marketingOptIn: true,
        },
      });
    });
  });

  describe("validateForgotPasswordForm", () => {
    it("exige e-mail válido", () => {
      const result = validateForgotPasswordForm(
        buildFormData({ email: "invalido" })
      );

      expect(result.ok).toBe(false);
    });
  });

  describe("validateResetPasswordForm", () => {
    it("exige confirmação igual à nova senha", () => {
      const result = validateResetPasswordForm(
        buildFormData({
          password: "nova-senha",
          passwordConfirmation: "outra-senha",
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.passwordConfirmation).toBe(
          "As senhas não coincidem."
        );
      }
    });

    it("aceita uma nova senha válida", () => {
      const result = validateResetPasswordForm(
        buildFormData({
          password: "nova-senha",
          passwordConfirmation: "nova-senha",
        })
      );

      expect(result).toEqual({ ok: true, data: { password: "nova-senha" } });
    });
  });
});

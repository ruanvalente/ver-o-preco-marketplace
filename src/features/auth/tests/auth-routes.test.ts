import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "../utils/auth-redirect";
import {
  buildLoginPath,
  getAuthRedirectTarget,
  isAuthPath,
  isProtectedPath,
} from "../utils/auth-routes";
import { getAuthNotice } from "../utils/auth-notice";

describe("auth redirects", () => {
  describe("safeRedirectPath", () => {
    it("aceita caminhos internos", () => {
      expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
      expect(safeRedirectPath("/dashboard?tab=anuncios")).toBe(
        "/dashboard?tab=anuncios"
      );
    });

    it("descarta destinos externos e protocol-relative", () => {
      expect(safeRedirectPath("https://evil.example")).toBe("/dashboard");
      expect(safeRedirectPath("//evil.example")).toBe("/dashboard");
      expect(safeRedirectPath("/\\evil.example")).toBe("/dashboard");
    });

    it("descarta valores vazios ou com caracteres de controle", () => {
      expect(safeRedirectPath("")).toBe("/dashboard");
      expect(safeRedirectPath(null)).toBe("/dashboard");
      expect(safeRedirectPath("/dashboard\nset-cookie")).toBe("/dashboard");
    });

    it("permite um fallback específico", () => {
      expect(safeRedirectPath("", "/login")).toBe("/login");
    });
  });

  describe("route matching", () => {
    it("identifica rotas protegidas", () => {
      expect(isProtectedPath("/dashboard")).toBe(true);
      expect(isProtectedPath("/dashboard/anuncios")).toBe(true);
      expect(isProtectedPath("/")).toBe(false);
      expect(isProtectedPath("/login")).toBe(false);
    });

    it("identifica rotas de autenticação", () => {
      expect(isAuthPath("/login")).toBe(true);
      expect(isAuthPath("/register")).toBe(true);
      expect(isAuthPath("/forgot-password")).toBe(true);
      expect(isAuthPath("/reset-password")).toBe(false);
    });
  });

  describe("getAuthRedirectTarget", () => {
    it("envia visitante anônimo para o login preservando o destino", () => {
      expect(
        getAuthRedirectTarget({
          isAuthenticated: false,
          pathname: "/dashboard",
          search: "?tab=anuncios",
        })
      ).toBe(`/login?next=${encodeURIComponent("/dashboard?tab=anuncios")}`);
    });

    it("não redireciona visitante anônimo em rota pública", () => {
      expect(
        getAuthRedirectTarget({
          isAuthenticated: false,
          pathname: "/",
        })
      ).toBeNull();
    });

    it("tira usuário autenticado das telas de entrada", () => {
      expect(
        getAuthRedirectTarget({
          isAuthenticated: true,
          pathname: "/login",
        })
      ).toBe("/dashboard");
    });

    it("mantém usuário autenticado na redefinição de senha", () => {
      expect(
        getAuthRedirectTarget({
          isAuthenticated: true,
          pathname: "/reset-password",
        })
      ).toBeNull();
    });
  });

  it("monta o caminho de login com destino seguro", () => {
    expect(buildLoginPath("/dashboard", "?x=1")).toBe(
      `/login?next=${encodeURIComponent("/dashboard?x=1")}`
    );
  });
});

describe("auth notices", () => {
  it("traduz códigos conhecidos", () => {
    expect(getAuthNotice("link-invalido")).toContain("inválido ou expirou");
  });

  it("ignora códigos desconhecidos ou vazios", () => {
    expect(getAuthNotice(null)).toBeNull();
    expect(getAuthNotice("desconhecido")).toBeNull();
  });
});

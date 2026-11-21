import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_REQUIREMENTS,
} from "../schemas/auth.schemas";
import { AccessRecoveryPage } from "../components/access-recovery/access-recovery-page";

describe("AccessRecoveryPage", () => {
  it("renders the recovery step as static content with a real link", () => {
    const { container } = render(<AccessRecoveryPage />);

    expect(container.querySelector("form")).toBeNull();
    expect(
      screen.getByRole("link", { name: /Enviar link de recuperação/ })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("removes fake controls from the next-step preview", () => {
    const { container } = render(<AccessRecoveryPage />);

    expect(container.querySelectorAll("input")).toHaveLength(0);
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Já recebi o link de recuperação" })
    ).toHaveAttribute("href", "/reset-password");
  });

  it("derives the displayed password rules from the shared schema", () => {
    render(<AccessRecoveryPage />);

    for (const requirement of PASSWORD_REQUIREMENTS) {
      expect(screen.getByText(requirement.label)).toBeInTheDocument();
    }
    expect(
      screen.getByText(`Máximo de ${PASSWORD_MAX_LENGTH} caracteres`)
    ).toBeInTheDocument();
  });

  it("does not advertise the old strength meter or the fake device switch", () => {
    render(<AccessRecoveryPage />);

    expect(screen.queryByText("Força da senha")).toBeNull();
    expect(screen.queryByText("Desconectar outros dispositivos")).toBeNull();
  });

  it("links back to login and identifies the screen as a preview", () => {
    render(<AccessRecoveryPage />);

    expect(
      screen.getByRole("link", { name: /Voltar para o Login/ })
    ).toHaveAttribute("href", "/login");
    expect(screen.getByText(/Prévia/)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/services/auth.actions", () => ({
  resetPasswordAction: vi.fn(),
}));

import { resetPasswordAction } from "@/features/auth/services/auth.actions";

import { ResetPasswordForm } from "../components/reset-password-form";

function fillPasswords(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText("Nova senha"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
    target: { value: confirmation },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(resetPasswordAction).mockReset();
  });

  it("impede senhas diferentes", async () => {
    render(<ResetPasswordForm />);

    fillPasswords("nova-senha", "outra-senha");
    submit();

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(resetPasswordAction).not.toHaveBeenCalled();
  });

  it("exige senha com tamanho mínimo", async () => {
    render(<ResetPasswordForm />);

    fillPasswords("curta", "curta");
    submit();

    expect(
      await screen.findByText("A senha deve ter pelo menos 8 caracteres.")
    ).toBeInTheDocument();
    expect(resetPasswordAction).not.toHaveBeenCalled();
  });

  it("exibe erro devolvido pelo servidor", async () => {
    vi.mocked(resetPasswordAction).mockResolvedValue({
      status: "error",
      message: "O link é inválido ou expirou. Solicite um novo.",
    });

    render(<ResetPasswordForm />);

    fillPasswords("nova-senha", "nova-senha");
    submit();

    expect(
      await screen.findByText("O link é inválido ou expirou. Solicite um novo.")
    ).toBeInTheDocument();
  });
});

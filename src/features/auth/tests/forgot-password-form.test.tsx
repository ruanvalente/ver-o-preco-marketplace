import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@/features/auth/services/auth.actions", () => ({
  forgotPasswordAction: vi.fn(),
}));

import { forgotPasswordAction } from "@/features/auth/services/auth.actions";

import { ForgotPasswordForm } from "../components/forgot-password-form";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(forgotPasswordAction).mockReset();
    mocks.searchParams = new URLSearchParams();
  });

  it("valida o e-mail antes de enviar", async () => {
    render(<ForgotPasswordForm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" })
    );

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(forgotPasswordAction).not.toHaveBeenCalled();
  });

  it("mostra mensagem neutra de envio", async () => {
    vi.mocked(forgotPasswordAction).mockResolvedValue({
      status: "success",
      message:
        "Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.",
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "pessoa@exemplo.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar link de recuperação" })
    );

    expect(
      await screen.findByText(/Se este e-mail estiver cadastrado/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Enviar para outro e-mail" })
    ).toBeInTheDocument();
  });

  it("exibe aviso de link inválido vindo da URL", () => {
    mocks.searchParams = new URLSearchParams("erro=link-invalido");

    render(<ForgotPasswordForm />);

    expect(
      screen.getByText(/O link que você usou é inválido ou expirou/)
    ).toBeInTheDocument();
  });
});

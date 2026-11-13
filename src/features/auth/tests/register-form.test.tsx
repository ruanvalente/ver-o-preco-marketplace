import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/services/auth.actions", () => ({
  registerAction: vi.fn(),
}));

import { registerAction } from "@/features/auth/services/auth.actions";

import { RegisterForm } from "../components/register-form";

function fillRegistration(values?: {
  name?: string;
  email?: string;
  municipality?: string;
  password?: string;
  confirmation?: string;
}) {
  fireEvent.change(screen.getByLabelText("Nome completo"), {
    target: { value: values?.name ?? "Maria Silva" },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: values?.email ?? "maria@exemplo.com" },
  });
  fireEvent.change(screen.getByLabelText("Município"), {
    target: { value: values?.municipality ?? "Belém" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: values?.password ?? "senha-segura" },
  });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), {
    target: { value: values?.confirmation ?? "senha-segura" },
  });
}

function acceptTerms() {
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Li e aceito os Termos de Uso/ })
  );
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.mocked(registerAction).mockReset();
  });

  it("renderiza campos, municípios e links legais", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Município")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar senha")).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Belém" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Santarém" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Termos de Uso" })
    ).toHaveAttribute("href", "/terms");
    expect(
      screen.getByRole("link", { name: "Política de Privacidade" })
    ).toHaveAttribute("href", "/privacy");
  });

  it("valida os campos obrigatórios antes de chamar o servidor", async () => {
    render(<RegisterForm />);

    submit();

    expect(await screen.findByText("Informe seu nome.")).toBeInTheDocument();
    expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Selecione seu município.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      )
    ).toBeInTheDocument();
    expect(registerAction).not.toHaveBeenCalled();

    expect(screen.getByLabelText("Município")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("atualiza os requisitos de senha enquanto o usuário digita", () => {
    render(<RegisterForm />);

    const password = screen.getByLabelText("Senha");
    const lengthRequirement = screen.getByText(
      "Pelo menos 8 caracteres"
    ).parentElement as HTMLElement;
    const symbolRequirement = screen.getByText(
      "Pelo menos um número ou símbolo"
    ).parentElement as HTMLElement;

    expect(lengthRequirement).toHaveTextContent("pendente");
    expect(symbolRequirement).toHaveTextContent("pendente");

    fireEvent.change(password, { target: { value: "senhasegura" } });

    expect(lengthRequirement).toHaveTextContent("atendido");
    expect(symbolRequirement).toHaveTextContent("pendente");

    fireEvent.change(password, { target: { value: "senha123" } });

    expect(symbolRequirement).toHaveTextContent("atendido");
  });

  it("avisa quando as senhas não coincidem", async () => {
    render(<RegisterForm />);

    fillRegistration({ confirmation: "outra-senha" });
    acceptTerms();
    submit();

    expect(
      await screen.findByText("As senhas não coincidem.")
    ).toBeInTheDocument();
    expect(registerAction).not.toHaveBeenCalled();
  });

  it("envia município e consentimentos ao servidor", async () => {
    vi.mocked(registerAction).mockResolvedValue({ status: "idle" });

    render(<RegisterForm />);

    fillRegistration();
    acceptTerms();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Quero receber novidades/ })
    );
    submit();

    await waitFor(() => expect(registerAction).toHaveBeenCalledTimes(1));

    const [, formData] = vi.mocked(registerAction).mock.calls[0];
    expect(formData.get("municipality")).toBe("Belém");
    expect(formData.get("termsAccepted")).toBe("on");
    expect(formData.get("marketingOptIn")).toBe("on");
  });

  it("mostra confirmação de e-mail após cadastro", async () => {
    vi.mocked(registerAction).mockResolvedValue({
      status: "success",
      message:
        "Enviamos um link de confirmação para maria@exemplo.com. Confirme para acessar sua conta.",
    });

    render(<RegisterForm />);

    fillRegistration();
    acceptTerms();
    submit();

    expect(
      await screen.findByText(/Enviamos um link de confirmação/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para entrar" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("exibe erro de cadastro devolvido pelo servidor", async () => {
    vi.mocked(registerAction).mockResolvedValue({
      status: "error",
      message:
        "Já existe uma conta com este e-mail. Tente entrar ou recuperar sua senha.",
    });

    render(<RegisterForm />);

    fillRegistration();
    acceptTerms();
    submit();

    expect(
      await screen.findByText(/Já existe uma conta com este e-mail/)
    ).toBeInTheDocument();
  });
});

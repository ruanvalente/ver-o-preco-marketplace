"use server";

import { redirect } from "next/navigation";
import {
  validateForgotPasswordForm,
  validateLoginForm,
  validateRegisterForm,
  validateResetPasswordForm,
} from "../schemas/auth.schemas";
import type { AuthActionState } from "../types/auth.types";
import { mapAuthError } from "../utils/auth-errors";
import { DEFAULT_AUTH_REDIRECT, safeRedirectPath } from "../utils/auth-redirect";
import { getSiteUrl } from "../utils/site-url";
import {
  requestPasswordReset,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updatePassword,
} from "./auth.service";

function readRedirectTarget(formData: FormData): string {
  const value = formData.get("redirectTo");
  return typeof value === "string" ? value : "";
}

function buildCallbackUrl(siteUrl: string, next: string): string {
  const callbackUrl = new URL("/auth/callback", siteUrl);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateLoginForm(formData);

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors };
  }

  const { error } = await signInWithPassword(validation.data);

  if (error) {
    return { status: "error", message: mapAuthError(error) };
  }

  redirect(safeRedirectPath(readRedirectTarget(formData)));
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateRegisterForm(formData);

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors };
  }

  const siteUrl = await getSiteUrl();
  const { error, hasSession } = await signUpWithPassword({
    ...validation.data,
    emailRedirectTo: buildCallbackUrl(siteUrl, DEFAULT_AUTH_REDIRECT),
  });

  if (error) {
    return { status: "error", message: mapAuthError(error) };
  }

  if (hasSession) {
    redirect(DEFAULT_AUTH_REDIRECT);
  }

  return {
    status: "success",
    email: validation.data.email,
    message: `Enviamos um link de confirmação para ${validation.data.email}. Confirme para acessar sua conta.`,
  };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateForgotPasswordForm(formData);

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors };
  }

  const siteUrl = await getSiteUrl();
  const { error } = await requestPasswordReset({
    email: validation.data.email,
    redirectTo: buildCallbackUrl(siteUrl, "/reset-password"),
  });

  if (error) {
    return { status: "error", message: mapAuthError(error) };
  }

  // Mensagem neutra: não confirma se o e-mail existe na base.
  return {
    status: "success",
    email: validation.data.email,
    message:
      "Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha. Verifique sua caixa de entrada e o spam.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validation = validateResetPasswordForm(formData);

  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.errors };
  }

  const { error } = await updatePassword(validation.data.password);

  if (error) {
    return { status: "error", message: mapAuthError(error) };
  }

  redirect(DEFAULT_AUTH_REDIRECT);
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/");
}

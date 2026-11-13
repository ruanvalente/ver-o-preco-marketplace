import { createClient } from "@/lib/supabase/server";
import type { AuthFailure } from "../types/auth.types";
import { toAuthFailure } from "../utils/auth-errors";

type AuthOperationResult = {
  error: AuthFailure | null;
};

export type SignUpResult = AuthOperationResult & {
  hasSession: boolean;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  municipality: string;
  password: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
  emailRedirectTo: string;
};

const TERMS_VERSION = "2026-10";

/**
 * Camada de serviço do Supabase Auth.
 *
 * Toda falha é normalizada em `AuthFailure` e nenhuma função lança para a UI:
 * assim os Server Actions conseguem devolver estados previsíveis.
 */
export async function signInWithPassword(
  input: SignInInput
): Promise<AuthOperationResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    return { error: error ? toAuthFailure(error) : null };
  } catch (error) {
    return { error: toAuthFailure(error) };
  }
}

export async function signUpWithPassword(
  input: SignUpInput
): Promise<SignUpResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          display_name: input.name,
          municipality: input.municipality,
          marketing_opt_in: input.marketingOptIn,
          terms_accepted_at: new Date().toISOString(),
          terms_version: TERMS_VERSION,
        },
        emailRedirectTo: input.emailRedirectTo,
      },
    });

    return {
      error: error ? toAuthFailure(error) : null,
      hasSession: Boolean(data.session),
    };
  } catch (error) {
    return { error: toAuthFailure(error), hasSession: false };
  }
}

export async function requestPasswordReset(input: {
  email: string;
  redirectTo: string;
}): Promise<AuthOperationResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: input.redirectTo,
    });

    return { error: error ? toAuthFailure(error) : null };
  } catch (error) {
    return { error: toAuthFailure(error) };
  }
}

export async function updatePassword(
  password: string
): Promise<AuthOperationResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: toAuthFailure(error) };
    }

    // Após redefinir a senha, encerra as demais sessões da conta.
    try {
      await supabase.auth.signOut({ scope: "others" });
    } catch {
      // A troca de senha já foi concluída; a revogação é uma proteção extra.
    }

    return { error: null };
  } catch (error) {
    return { error: toAuthFailure(error) };
  }
}

export async function signOut(): Promise<AuthOperationResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    return { error: error ? toAuthFailure(error) : null };
  } catch (error) {
    return { error: toAuthFailure(error) };
  }
}

export async function exchangeCodeForSession(
  code: string
): Promise<AuthOperationResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    return { error: error ? toAuthFailure(error) : null };
  } catch (error) {
    return { error: toAuthFailure(error) };
  }
}

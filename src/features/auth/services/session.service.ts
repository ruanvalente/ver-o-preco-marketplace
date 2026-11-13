import { cache } from "react";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "../types/auth.types";
import { DEFAULT_AUTH_REDIRECT } from "../utils/auth-redirect";
import { buildLoginPath } from "../utils/auth-routes";

/**
 * Data Access Layer da autenticação.
 *
 * `cache` deduplica a leitura da sessão durante o mesmo render pass (por
 * exemplo, header e página protegida na mesma requisição).
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email ?? null,
    };
  } catch {
    return null;
  }
});

export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();

  if (user) {
    redirect(DEFAULT_AUTH_REDIRECT);
  }
}

/**
 * Garante uma sessão válida no servidor antes de renderizar áreas protegidas.
 */
export async function requireUser(currentPath: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginPath(currentPath));
  }

  return user;
}

import { cache } from "react";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "../types/auth.types";
import { DEFAULT_AUTH_REDIRECT } from "../utils/auth-redirect";
import { buildLoginPath } from "../utils/auth-routes";
import { isListingOwnedBy } from "@/features/listings/services/listing.service";

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

type OwnershipResult =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: "not-owner" | "unavailable" };

/**
 * Garante que o usuário autenticado é o proprietário do anúncio informado.
 *
 * Double-check de propriedade: a autenticação é validada por `requireUser` e a
 * posse do anúncio é conferida contra o `seller_id` do banco. Assim, mesmo se a
 * RLS falhar, a camada de aplicação continua negando acesso com um erro amigável.
 *
 * O motivo da negação volta em `reason`: `not-owner` para anúncio inexistente ou
 * alheio (sem distinguir os dois, para não enumerar anúncios) e `unavailable`
 * para falha transitória de banco, que o chamador traduz em erro com retry.
 */
export async function requireOwnership(
  currentPath: string,
  listingId: string,
): Promise<OwnershipResult> {
  const user = await requireUser(currentPath);

  const result = await isListingOwnedBy(user.id, listingId);

  if (!result.ok) {
    return { ok: false, reason: "unavailable" };
  }

  if (!result.data) {
    return { ok: false, reason: "not-owner" };
  }

  return { ok: true, user };
}

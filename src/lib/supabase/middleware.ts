import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseKey } from "@/config/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = getSupabaseKey();

export type SessionUpdate = {
  response: NextResponse;
  user: User | null;
};

/**
 * Atualiza a sessão do Supabase e devolve o usuário atual.
 *
 * O proxy usa o usuário apenas para checagens otimistas de rota; a
 * autorização real acontece no servidor, a cada operação protegida.
 */
export async function updateSession(
  request: NextRequest
): Promise<SessionUpdate> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: supabaseResponse, user: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const { data } = await supabase.auth.getUser();

    return { response: supabaseResponse, user: data.user ?? null };
  } catch {
    return { response: supabaseResponse, user: null };
  }
}

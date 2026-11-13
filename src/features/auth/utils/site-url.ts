import { headers } from "next/headers";

const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * URL pública da aplicação, usada nos links de confirmação e recuperação
 * enviados pelo Supabase Auth.
 *
 * Em produção, prefira configurar `NEXT_PUBLIC_SITE_URL`. Sem ela, usamos o
 * host da requisição como fallback.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    return DEFAULT_SITE_URL;
  }

  const forwardedProtocol = headerList.get("x-forwarded-proto");
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = forwardedProtocol ?? (isLocalHost ? "http" : "https");

  return `${protocol}://${host}`;
}

/**
 * Constantes compartilhadas do módulo de perfil.
 *
 * O nome do bucket é usado tanto pelo upload no browser quanto pelo acesso
 * público da imagem, por isso fica em um módulo neutro (sem imports de
 * Supabase) para evitar divergência entre os dois lados.
 */
export const AVATAR_BUCKET_NAME = "veropreco/avatar/profile";

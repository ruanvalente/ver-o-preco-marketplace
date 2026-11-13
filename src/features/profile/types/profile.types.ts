/**
 * Tipos de domínio do módulo de perfil.
 *
 * Nenhum tipo do Supabase é exposto para componentes de UI: apenas os dados
 * necessários para a aplicação.
 */

export type Profile = {
  id: string;
  displayName: string | null;
  avatarPath: string | null;
  avatarUrl: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUpdateInput = {
  displayName?: string | null;
  location?: string | null;
};

export type ProfileActionStatus = "idle" | "loading" | "error" | "success";

export type ProfileActionState = {
  status: ProfileActionStatus;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialProfileState: ProfileActionState = { status: "idle" };

export type ProfileAvatarUploadResult = {
  success: boolean;
  avatarPath?: string;
  avatarUrl?: string;
  error?: string;
};

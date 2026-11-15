import { createClient as createBrowserClient } from "@/lib/supabase/client";

import { AVATAR_BUCKET_NAME } from "../constants";
import { isAvatarPathForUser, validateAvatarFile } from "../schemas/profile.schemas";

const avatarExtensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Client-side version for uploads from browser
export async function uploadAvatarClient(file: File, userId: string): Promise<{
  success: boolean;
  avatarPath?: string;
  error?: string;
}> {
  try {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const supabase = createBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Error verifying avatar upload user:", authError);
      return { success: false, error: "Sua sessão expirou. Entre novamente." };
    }

    if (!authData.user || authData.user.id !== userId) {
      return { success: false, error: "Entre na sua conta para alterar seu avatar." };
    }

    const fileExt = avatarExtensionsByMimeType[file.type];
    if (!fileExt) {
      return { success: false, error: "Formato de imagem não suportado. Use JPG, PNG ou WebP." };
    }

    const filePath = `${authData.user.id}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading avatar:", error);
      return { success: false, error: "Não foi possível fazer upload da imagem." };
    }

    if (!isAvatarPathForUser(data.path, authData.user.id)) {
      return { success: false, error: "O Storage retornou um caminho de avatar inválido." };
    }

    return { success: true, avatarPath: data.path };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Não foi possível fazer upload da imagem." };
  }
}

export async function removeObsoleteAvatarsClient(
  userId: string,
  currentAvatarPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Error verifying avatar cleanup user:", authError);
      return { success: false, error: "O avatar foi atualizado, mas não foi possível remover arquivos antigos." };
    }

    if (
      !authData.user ||
      authData.user.id !== userId ||
      !isAvatarPathForUser(currentAvatarPath, authData.user.id)
    ) {
      return { success: false, error: "O avatar foi atualizado, mas não foi possível remover arquivos antigos." };
    }

    const { data: existingFiles, error: listError } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .list(authData.user.id);

    if (listError) {
      console.error("Error listing existing avatars:", listError);
      return { success: false, error: "O avatar foi atualizado, mas não foi possível remover arquivos antigos." };
    }

    const filesToRemove = existingFiles
      .filter((file) => /^avatar\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .map((file) => `${authData.user.id}/${file.name}`)
      .filter((path) => path !== currentAvatarPath);

    if (filesToRemove.length === 0) {
      return { success: true };
    }

    const { error: removeError } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .remove(filesToRemove);

    if (removeError) {
      console.error("Error cleaning up old avatars:", removeError);
      return { success: false, error: "O avatar foi atualizado, mas não foi possível remover arquivos antigos." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error cleaning up old avatars:", error);
    return { success: false, error: "O avatar foi atualizado, mas não foi possível remover arquivos antigos." };
  }
}

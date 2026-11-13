import { createClient as createBrowserClient } from "@/lib/supabase/client";

import { AVATAR_BUCKET_NAME } from "../constants";
import { validateAvatarFile } from "../schemas/profile.schemas";

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
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar.${fileExt}`;

    // Remove existing avatar if any
    try {
      const { data: existingFiles } = await supabase.storage
        .from(AVATAR_BUCKET_NAME)
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from(AVATAR_BUCKET_NAME).remove(filesToRemove);
      }
    } catch (error) {
      console.error("Error cleaning up old avatar:", error);
    }

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

    return { success: true, avatarPath: data.path };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Não foi possível fazer upload da imagem." };
  }
}

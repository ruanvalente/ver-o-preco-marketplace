"use server";

import { requireUser } from "@/features/auth/services/session.service";
import { revalidatePath } from "next/cache";
import type { ProfileActionState } from "../types/profile.types";
import { upsertProfile } from "./profile.service";
import { isAvatarPathForUser, validateProfileUpdate } from "../schemas/profile.schemas";

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  try {
    const user = await requireUser("/profile");

    const displayName = formData.get("displayName");
    const location = formData.get("location");

    const input = {
      displayName: typeof displayName === "string" ? displayName : null,
      location: typeof location === "string" ? location : null,
    };

    const validation = validateProfileUpdate(input);
    if (!validation.ok) {
      return { status: "error", fieldErrors: validation.errors };
    }

    const profile = await upsertProfile(user.id, validation.data);

    if (!profile) {
      return { status: "error", message: "Não foi possível atualizar o perfil." };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { status: "success", message: "Perfil atualizado com sucesso." };
  } catch (error) {
    return { status: "error", message: "Não foi possível atualizar o perfil." };
  }
}

export async function updateAvatarAction(avatarPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser("/profile");

    if (!isAvatarPathForUser(avatarPath, user.id)) {
      return { success: false, error: "Caminho de avatar inválido." };
    }

    const profile = await upsertProfile(user.id, { avatarPath });

    if (!profile) {
      return { success: false, error: "Não foi possível atualizar o avatar." };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { success: false, error: "Não foi possível atualizar o avatar." };
  }
}

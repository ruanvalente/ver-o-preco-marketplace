import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/features/auth/utils/auth-errors";
import type { Profile, ProfileUpdateInput } from "../types/profile.types";
import { validateProfileUpdate } from "../schemas/profile.schemas";

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfileRow(row: ProfileRow): Profile {
  // We can't construct public URLs in server components easily without creating client
  // The avatarUrl will be populated where needed
  return {
    id: row.id,
    displayName: row.display_name,
    avatarPath: row.avatar_path,
    avatarUrl: null,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_path, location, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapProfileRow(data as ProfileRow);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_path, location, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching public profile:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapProfileRow(data as ProfileRow);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export async function createProfile(userId: string, data: ProfileUpdateInput): Promise<Profile | null> {
  try {
    const validation = validateProfileUpdate(data);
    if (!validation.ok) {
      throw new Error("Validation failed");
    }

    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        display_name: validation.data.displayName,
        location: validation.data.location,
      })
      .select("id, display_name, avatar_path, location, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return mapProfileRow(row as ProfileRow);
  } catch (error) {
    console.error("Error creating profile:", error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: ProfileUpdateInput & { avatarPath?: string | null }
): Promise<Profile | null> {
  try {
    const validation = validateProfileUpdate(data);
    if (!validation.ok) {
      throw new Error("Validation failed");
    }

    const supabase = await createClient();
    const updateData: Record<string, unknown> = {
      display_name: validation.data.displayName,
      location: validation.data.location,
      updated_at: new Date().toISOString(),
    };
    
    if ('avatarPath' in data) {
      updateData.avatar_path = data.avatarPath;
    }

    const { data: row, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select("id, display_name, avatar_path, location, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    return mapProfileRow(row as ProfileRow);
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

export async function upsertProfile(
  userId: string,
  data: ProfileUpdateInput & { avatarPath?: string | null }
): Promise<Profile | null> {
  try {
    const validation = validateProfileUpdate(data);
    if (!validation.ok) {
      throw new Error("Validation failed");
    }

    const supabase = await createClient();
    const upsertData: Record<string, unknown> = {
      id: userId,
      display_name: validation.data.displayName,
      location: validation.data.location,
      updated_at: new Date().toISOString(),
    };
    
    if ('avatarPath' in data) {
      upsertData.avatar_path = data.avatarPath;
    }

    const { data: row, error } = await supabase
      .from("profiles")
      .upsert(upsertData, { onConflict: "id" })
      .select("id, display_name, avatar_path, location, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error upserting profile:", error);
      return null;
    }

    return mapProfileRow(row as ProfileRow);
  } catch (error) {
    console.error("Error upserting profile:", error);
    return null;
  }
}

import type { ProfileUpdateInput } from "../types/profile.types";

export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 80;
export const LOCATION_MAX_LENGTH = 120;

export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function validateDisplayName(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return `O nome deve ter pelo menos ${DISPLAY_NAME_MIN_LENGTH} caracteres.`;
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return `O nome deve ter no máximo ${DISPLAY_NAME_MAX_LENGTH} caracteres.`;
  }

  return undefined;
}

export function validateLocation(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length > LOCATION_MAX_LENGTH) {
    return `A localização deve ter no máximo ${LOCATION_MAX_LENGTH} caracteres.`;
  }

  return undefined;
}

export function validateProfileUpdate(
  input: ProfileUpdateInput
): ValidationResult<ProfileUpdateInput> {
  const errors: Record<string, string> = {};

  const displayNameError = validateDisplayName(input.displayName);
  if (displayNameError) errors.displayName = displayNameError;

  const locationError = validateLocation(input.location);
  if (locationError) errors.location = locationError;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const data: ProfileUpdateInput = {
    displayName:
      input.displayName === null || input.displayName === undefined
        ? null
        : input.displayName.trim() === ""
        ? null
        : input.displayName.trim(),
    location:
      input.location === null || input.location === undefined
        ? null
        : input.location.trim() === ""
        ? null
        : input.location.trim(),
  };

  return { ok: true, data };
}

export function validateAvatarFile(file: File): string | undefined {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as AvatarMimeType)) {
    return "Formato de imagem não suportado. Use JPG, PNG ou WebP.";
  }

  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return "A imagem deve ter no máximo 2MB.";
  }

  return undefined;
}

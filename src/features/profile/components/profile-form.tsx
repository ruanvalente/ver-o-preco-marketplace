"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "../services/profile.actions";
import { initialProfileState } from "../types/profile.types";
import { FormAlert } from "@/features/auth/components/form-alert";

type ProfileFormProps = {
  initialDisplayName: string | null;
  initialLocation: string | null;
};

export function ProfileForm({ initialDisplayName, initialLocation }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialProfileState);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message ? (
        <FormAlert tone="error">{state.message}</FormAlert>
      ) : null}
      {state.status === "success" && state.message ? (
        <FormAlert tone="success">{state.message}</FormAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="displayName">Nome de exibição</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={initialDisplayName || ""}
          placeholder="Como você deseja ser chamado"
          aria-invalid={Boolean(state.fieldErrors?.displayName)}
        />
        {state.fieldErrors?.displayName ? (
          <p className="text-sm text-destructive">{state.fieldErrors.displayName}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          name="location"
          type="text"
          defaultValue={initialLocation || ""}
          placeholder="Ex: Belém, PA"
          aria-invalid={Boolean(state.fieldErrors?.location)}
        />
        {state.fieldErrors?.location ? (
          <p className="text-sm text-destructive">{state.fieldErrors.location}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}

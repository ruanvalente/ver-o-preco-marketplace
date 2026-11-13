import { getProfile } from "../services/profile.service";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileForm } from "./profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProfilePageProps = {
  userId: string;
};

export async function ProfilePage({ userId }: ProfilePageProps) {
  const profile = await getProfile(userId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foto do perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <ProfileAvatar
              userId={userId}
              displayName={profile?.displayName || null}
              avatarUrl={profile?.avatarUrl || null}
            />
            <p className="text-sm text-muted-foreground text-center">
              Clique na foto para alterar seu avatar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialDisplayName={profile?.displayName || null}
              initialLocation={profile?.location || null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

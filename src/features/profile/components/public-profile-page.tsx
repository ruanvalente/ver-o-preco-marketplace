import { getProfileById } from "../services/profile.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

type PublicProfilePageProps = {
  userId: string;
};

export async function PublicProfilePage({ userId }: PublicProfilePageProps) {
  const profile = await getProfileById(userId);

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Perfil não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar size="lg" className="h-16 w-16">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName || "Avatar"} />
              <AvatarFallback className="text-lg">{getInitials(profile.displayName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {profile.displayName || "Usuário"}
              </CardTitle>
              {profile.location ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateAvatarClient } from "../services/profile-storage.service";

type ProfileAvatarProps = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  onAvatarUpdate?: (avatarPath: string) => void;
};

export function ProfileAvatar({
  userId,
  displayName,
  avatarUrl,
  onAvatarUpdate,
}: ProfileAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await updateAvatarClient(file, userId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setCurrentAvatarUrl(result.avatarUrl);
      onAvatarUpdate?.(result.avatarPath);

      if (result.cleanupError) {
        toast.error(result.cleanupError);
      } else {
        toast.success("Avatar atualizado com sucesso!");
      }
    } catch {
      toast.error("Erro ao fazer upload da imagem.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Avatar size="lg" className="h-24 w-24 cursor-pointer" onClick={handleClick}>
        <AvatarImage src={currentAvatarUrl || undefined} alt={displayName || "Avatar"} />
        <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <Button
        size="sm"
        variant="secondary"
        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

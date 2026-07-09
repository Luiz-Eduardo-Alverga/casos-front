"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Info, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserAvatarDropzone } from "@/components/header/user-avatar-dropzone";
import {
  useDeleteUserAvatar,
  useUploadUserAvatar,
  useUserAvatarUrl,
} from "@/hooks/use-user-avatar";
import { validateUserAvatarFile } from "@/services/db-api/user-avatar";
import { cn } from "@/lib/utils";

interface AlterarFotoPerfilModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AlterarFotoPerfilModal({
  open,
  onOpenChange,
  userName,
}: AlterarFotoPerfilModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: avatarData, isLoading: isLoadingAvatar } = useUserAvatarUrl(open);
  const uploadAvatar = useUploadUserAvatar();
  const deleteAvatar = useDeleteUserAvatar();

  const isBusy =
    uploadAvatar.isPending || deleteAvatar.isPending || isLoadingAvatar;

  const initials = useMemo(() => getInitials(userName), [userName]);
  const displayUrl = previewUrl ?? avatarData?.avatarUrl ?? null;

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setDragOver(false);
      setPreviewUrl(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAddFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;

    const validationError = validateUserAvatarFile(file);
    if (validationError) {
      toast.error(validationError, { position: "top-right" });
      return;
    }

    if (incoming.length > 1) {
      toast.error("Selecione apenas uma imagem por vez", {
        position: "top-right",
      });
    }

    setSelectedFile(file);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Selecione uma imagem para continuar", {
        position: "top-right",
      });
      return;
    }

    try {
      await uploadAvatar.mutateAsync(selectedFile);
      toast.success("Foto de perfil atualizada", { position: "top-right" });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar foto",
        { position: "top-right" },
      );
    }
  };

  const handleRemove = async () => {
    if (!avatarData?.avatarUrl && !selectedFile) return;

    try {
      if (avatarData?.avatarUrl) {
        await deleteAvatar.mutateAsync();
      }
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
      toast.success("Foto de perfil removida", { position: "top-right" });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao remover foto",
        { position: "top-right" },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Alterar foto de perfil</DialogTitle>
      <DialogContent className="max-h-[90vh] w-[min(96vw,480px)] max-w-[480px] min-w-0 gap-0 overflow-y-auto overflow-x-hidden border-border-divider p-0 sm:rounded-2xl">
        <div className="min-w-0 bg-card p-6">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-text-primary">
                Alterar foto de perfil
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                Envie uma imagem PNG, JPG ou WEBP de até 2 MB para atualizar
                sua foto em {userName}.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="relative">
              <Avatar className="size-28 border-4 border-card shadow-lg ring-1 ring-border">
                {displayUrl ? (
                  <AvatarImage src={displayUrl} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-blue-500 text-2xl font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {displayUrl ? (
                <span className="absolute right-1 top-1 size-3 rounded-full border-2 border-card bg-emerald-500" />
              ) : null}
            </div>

            <div className="mt-6 w-full">
              <UserAvatarDropzone
                inputRef={inputRef}
                dragOver={dragOver}
                setDragOver={setDragOver}
                canInteract={!isBusy}
                disabled={isBusy}
                onAddFiles={handleAddFiles}
              />
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Recomendado: imagem quadrada de 400×400px
            </p>

            {selectedFile ? (
              <p className="mt-2 max-w-full truncate text-center text-xs text-muted-foreground">
                {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy || (!avatarData?.avatarUrl && !selectedFile)}
              onClick={() => void handleRemove()}
              className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              {deleteAvatar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remover foto atual
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
                className="flex-1 sm:min-w-[120px]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isBusy || !selectedFile}
                onClick={() => void handleSave()}
                className={cn("flex-1 sm:min-w-[120px]")}
              >
                {uploadAvatar.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar foto"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

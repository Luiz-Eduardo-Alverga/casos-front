"use client";

import { Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmarExclusaoPapelModalProps {
  open: boolean;
  roleName: string;
  confirmationText: string;
  onConfirmationTextChange: (value: string) => void;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmarExclusaoPapelModal({
  open,
  roleName,
  confirmationText,
  onConfirmationTextChange,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ConfirmarExclusaoPapelModalProps) {
  const isValid = confirmationText === roleName && roleName.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-lg p-6">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-bold leading-[1.2] text-foreground">
              {`Excluir "${roleName}"`}
            </DialogTitle>
            <DialogDescription className="text-[15px] font-medium text-muted-foreground">
              {`Deseja mesmo excluir o perfil de acesso "${roleName}" ? Esta ação é irreversível`}
            </DialogDescription>
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="role-delete-confirmation-input"
            >
              Insira o nome do Perfil de acesso
            </label>
            <Input
              id="role-delete-confirmation-input"
              value={confirmationText}
              onChange={(e) => onConfirmationTextChange(e.target.value)}
              disabled={isDeleting}
            />
          </div>

          <div className="flex w-full items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={!isValid || isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? "Excluindo..." : "Excluir perfil"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

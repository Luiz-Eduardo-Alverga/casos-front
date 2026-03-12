"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmacaoModal({
  open,
  onOpenChange,
  titulo,
  descricao,
  confirmarLabel = "Confirmar",
  cancelarLabel = "Cancelar",
  onConfirm,
  variant = "default",
  isLoading = false,
}: ConfirmacaoModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isLoading && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-text-primary">
            {titulo}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            {descricao}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-[42px] px-4"
          >
            {cancelarLabel}
          </Button>
          <Button
            type="button"
            className={cn(
              "h-[42px] px-4",
              variant === "danger" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Aguarde..." : confirmarLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

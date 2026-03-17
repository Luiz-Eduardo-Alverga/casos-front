"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
  /** Chamado ao cancelar, fechar pelo X, clique fora ou Esc (não após confirmar). */
  onCancel?: () => void;
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
  onCancel,
  variant = "default",
  isLoading = false,
}: ConfirmacaoModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const dismiss = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md gap-0 p-0 overflow-hidden"
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
          else onCancel?.();
        }}
        onEscapeKeyDown={() => onCancel?.()}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/alert.svg"
              alt=""
              width={64}
              height={64}
              aria-hidden
              className="shrink-0"
            />
          </div>
          <DialogTitle className="text-lg font-semibold text-text-primary text-center max-w-[280px]">
            {titulo}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary text-center mt-2 max-w-[280px]">
            {descricao}
          </DialogDescription>
        </div>

        <div className="h-px bg-border shrink-0" aria-hidden />

        <div className="flex flex-row gap-3 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={dismiss}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelarLabel}
          </Button>
          <Button
            type="button"
            className={cn(
              "flex-1",
              variant === "danger"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-[#2d2d2d] text-white hover:bg-[#3d3d3d]",
            )}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Aguarde..." : confirmarLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

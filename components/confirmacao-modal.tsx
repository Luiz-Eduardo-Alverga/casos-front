"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ModalLottieIcon } from "@/components/modal-lottie-icon";

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
      <DialogTitle className="sr-only">{titulo}</DialogTitle>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
          else onCancel?.();
        }}
        onEscapeKeyDown={() => onCancel?.()}
      >
        <div className="flex flex-col justify-center pt-6 space-y-4">
          <ModalLottieIcon
            variant={variant === "danger" ? "danger" : "alert"}
            playKey={`${open}-${variant}`}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center space-y-4"
          >
            <div>
              <h1 className="text-xl font-bold">{titulo}</h1>
              <p className=" mt-2 text-text-secondary">{descricao}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={dismiss}
                disabled={isLoading}
              >
                {cancelarLabel}
              </Button>
              <Button
                type="button"
                className={cn(
                  variant === "danger"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-papeis-button-dark-bg text-white hover:bg-papeis-button-dark-bg-hover",
                )}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : confirmarLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

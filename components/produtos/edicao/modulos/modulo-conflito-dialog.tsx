"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ModuloConflitoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduloLabel?: string;
}

export function ModuloConflitoDialog({
  open,
  onOpenChange,
  moduloLabel,
}: ModuloConflitoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {PRODUTO_LABELS.conflitoModuloTitulo}
            {moduloLabel ? ` ${moduloLabel}` : ""}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-secondary">
          {PRODUTO_LABELS.conflitoModuloDescricao}
        </p>
        <Button type="button" onClick={() => onOpenChange(false)}>
          {PRODUTO_LABELS.entendi}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

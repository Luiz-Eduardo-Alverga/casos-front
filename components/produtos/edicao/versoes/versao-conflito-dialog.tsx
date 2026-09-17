"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface VersaoConflitoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versaoLabel?: string;
}

export function VersaoConflitoDialog({
  open,
  onOpenChange,
  versaoLabel,
}: VersaoConflitoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {PRODUTO_LABELS.conflitoVersaoTitulo}
            {versaoLabel ? ` ${versaoLabel}` : ""}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-secondary">
          {PRODUTO_LABELS.conflitoVersaoDescricao}
        </p>
        <p className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-2 text-sm text-status-warning">
          {PRODUTO_LABELS.conflitoVersaoAviso}
        </p>
        <Button type="button" onClick={() => onOpenChange(false)}>
          {PRODUTO_LABELS.entendi}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

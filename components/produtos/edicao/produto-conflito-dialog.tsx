"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUTO_LABELS } from "@/components/produtos/constants";

export interface ProdutoConflitoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  aviso?: string;
}

export function ProdutoConflitoDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  aviso,
}: ProdutoConflitoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-secondary">{descricao}</p>
        {aviso ? (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {aviso}
          </p>
        ) : null}
        <Button type="button" onClick={() => onOpenChange(false)}>
          {PRODUTO_LABELS.entendi}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

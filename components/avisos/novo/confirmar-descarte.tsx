"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmarDescarteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmarDescarte({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmarDescarteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Descartar aviso?</DialogTitle>
          <DialogDescription>
            O título, a descrição e os destinatários escolhidos serão perdidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continuar editando
          </Button>
          <Button
            variant="outline"
            className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            onClick={onConfirm}
          >
            Descartar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

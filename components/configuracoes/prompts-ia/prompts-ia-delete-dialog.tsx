"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PromptRow } from "./types";

interface PromptsIaDeleteDialogProps {
  open: boolean;
  prompt?: PromptRow | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PromptsIaDeleteDialog({
  open,
  prompt,
  isPending,
  onClose,
  onConfirm,
}: PromptsIaDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir prompt</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o prompt{" "}
            <strong>{prompt?.name}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import {
  todayIsoDate,
  toDateInput,
} from "@/components/produtos/edicao/versoes/utils";
import type { ProdutoVersaoData } from "@/services/produtos/types";

export interface VersaoFecharModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versao: ProdutoVersaoData | null;
  isSaving?: boolean;
  onConfirm: (fechamento: string) => void | Promise<void>;
}

export function VersaoFecharModal({
  open,
  onOpenChange,
  versao,
  isSaving = false,
  onConfirm,
}: VersaoFecharModalProps) {
  const abertura = toDateInput(versao?.DataAberturaProjeto);
  const [fechamento, setFechamento] = useState(todayIsoDate());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFechamento(toDateInput(versao?.DataFechamentoProjeto) || todayIsoDate());
    setError("");
  }, [open, versao]);

  async function handleConfirm() {
    const value = fechamento.trim();
    if (!value) {
      setError(PRODUTO_LABELS.dataFechamentoObrigatoria);
      return;
    }
    if (abertura && value < abertura) {
      setError(PRODUTO_LABELS.fechamentoAnteriorAbertura);
      return;
    }
    await onConfirm(value);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {PRODUTO_LABELS.fecharVersao} {versao?.Versao}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-secondary">
          {PRODUTO_LABELS.fecharVersaoDescricao}
        </p>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-text-label">
            {PRODUTO_LABELS.dataFechamento}{" "}
            <span className="text-text-error">*</span>
          </Label>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Input
            type="date"
            className="h-9 rounded-lg border-border-input"
            value={fechamento}
            onChange={(event) => {
              setFechamento(event.target.value);
              setError("");
            }}
            disabled={isSaving}
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {PRODUTO_LABELS.cancelar}
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {PRODUTO_LABELS.salvando}
              </>
            ) : (
              PRODUTO_LABELS.fecharVersao
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

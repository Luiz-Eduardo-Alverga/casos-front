"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLACEHOLDER_DESCRICAO_COMPLETA } from "@/components/casos/edicao/anotacoes/utils";

export type ReportAcaoAnotacaoTipo = "incompleto" | "suspender";

interface ReportAcaoAnotacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: ReportAcaoAnotacaoTipo;
  casoId: number | null;
  onConfirm: (anotacao: string) => Promise<boolean>;
  isLoading?: boolean;
}

const MODAL_CONFIG: Record<
  ReportAcaoAnotacaoTipo,
  { titulo: string; loadingLabel: string; icon: typeof AlertTriangle }
> = {
  incompleto: {
    titulo: "Marcar como incompleto",
    loadingLabel: "Concluindo...",
    icon: AlertTriangle,
  },
  suspender: {
    titulo: "Suspender report",
    loadingLabel: "Concluindo...",
    icon: X,
  },
};

export function ReportAcaoAnotacaoModal({
  open,
  onOpenChange,
  tipo,
  casoId,
  onConfirm,
  isLoading = false,
}: ReportAcaoAnotacaoModalProps) {
  const [anotacao, setAnotacao] = useState("");
  const config = MODAL_CONFIG[tipo];
  const Icon = config.icon;
  const canSubmit = Boolean(anotacao.trim()) && !isLoading;

  useEffect(() => {
    if (!open) {
      setAnotacao("");
    }
  }, [open]);

  const handleConfirmar = async () => {
    const texto = anotacao.trim();
    if (!texto) {
      toast.error("Informe a anotação.");
      return;
    }

    const shouldClose = await onConfirm(texto);
    if (shouldClose) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">{config.titulo}</DialogTitle>
      <DialogContent className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 overflow-y-auto overflow-x-hidden p-0">
        <div className="min-w-0 rounded-lg border border-border-divider bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 border-b border-border-divider pb-4">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="text-xl font-semibold text-text-primary">
              {config.titulo}
              {casoId != null ? (
                <span className="ml-2 text-base font-normal text-text-secondary">
                  #{casoId}
                </span>
              ) : null}
            </h3>
          </div>

          <div className="min-w-0 space-y-2 py-5">
            <Label
              htmlFor="report-acao-anotacao"
              className="text-sm font-medium text-text-label"
            >
              Anotação
            </Label>
            <Textarea
              id="report-acao-anotacao"
              placeholder={PLACEHOLDER_DESCRICAO_COMPLETA}
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              className="min-h-[158px] w-full rounded-lg border-border-input px-4 py-3"
              disabled={isLoading}
            />
          </div>

          <div className="flex min-w-0 w-full gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={!canSubmit}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {config.loadingLabel}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-3.5 w-3.5" />
                  Concluir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

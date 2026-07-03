"use client";

import { useEffect, useState } from "react";
import { Ban, CircleHelp, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReportCardData } from "./types";
import { ReportModalInfoBlock } from "./report-modal-info-block";

export type ReportAcaoAnotacaoTipo = "incompleto" | "suspender";

interface ReportAcaoAnotacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: ReportAcaoAnotacaoTipo;
  reportData: ReportCardData | null;
  onConfirm: (anotacao: string) => Promise<boolean>;
  isLoading?: boolean;
}

const MOTIVO_PLACEHOLDER =
  "Descreva o motivo com detalhes suficientes para o Suporte entender o que precisa ser feito...";

const MODAL_CONFIG: Record<
  ReportAcaoAnotacaoTipo,
  {
    titulo: string;
    descricao: string;
    loadingLabel: string;
    icon: typeof CircleHelp;
    iconBoxClass: string;
    iconClass: string;
    confirmButtonClass: string;
  }
> = {
  incompleto: {
    titulo: "Marcar como incompleto",
    descricao: "Descreva o que falta para o Suporte complementar o report.",
    loadingLabel: "Concluindo...",
    icon: CircleHelp,
    iconBoxClass: "bg-amber-50",
    iconClass: "text-amber-600",
    confirmButtonClass:
      "bg-amber-500 text-white hover:bg-amber-500/90 disabled:opacity-50",
  },
  suspender: {
    titulo: "Suspender report",
    descricao: "Explique por que este report está sendo suspenso.",
    loadingLabel: "Concluindo...",
    icon: Ban,
    iconBoxClass: "bg-red-50",
    iconClass: "text-red-500",
    confirmButtonClass:
      "bg-red-400 text-white hover:bg-red-400/90 disabled:opacity-50",
  },
};

export function ReportAcaoAnotacaoModal({
  open,
  onOpenChange,
  tipo,
  reportData,
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
      <DialogContent className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 gap-0 overflow-y-auto overflow-x-hidden border-border-divider p-0 sm:rounded-2xl">
        <div className="min-w-0 bg-card p-6">
          <div className="flex items-start gap-3 pr-6">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                config.iconBoxClass,
              )}
            >
              <Icon className={cn("h-5 w-5", config.iconClass)} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-text-primary">
                {config.titulo}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {config.descricao}
              </p>
            </div>
          </div>

          {reportData ? (
            <div className="mt-5">
              <ReportModalInfoBlock data={reportData} />
            </div>
          ) : null}

          <div className="mt-5 min-w-0 space-y-2">
            <Label
              htmlFor="report-acao-anotacao"
              className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
            >
              Motivo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="report-acao-anotacao"
              placeholder={MOTIVO_PLACEHOLDER}
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              className="min-h-[120px] w-full resize-none  border-border-input px-4 py-3 text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-text-secondary">
              {anotacao.length} caracteres
            </p>
          </div>

          <div className="mt-2 flex items-center  justify-end gap-3 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className=" flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={!canSubmit}
              className={cn("px-5 flex-1")}
            >
              {isLoading ? (
                <>
                  <Loader2 className=" h-3.5 w-3.5 animate-spin" />
                  {config.loadingLabel}
                </>
              ) : (
                <>
                  <Check className=" h-3.5 w-3.5" />
                  {tipo === "incompleto"
                    ? "Marcar como incompleto"
                    : "Suspender report"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useUpdatePainelIdeia } from "@/hooks/painel/use-update-painel-ideia";
import type { PainelIdeiaItem } from "@/services/painel-ideias/get-painel-ideias";
import type { PainelIdeiaConcluido } from "@/services/painel-ideias/update-painel-ideia";
import {
  isMelhoriaAprovada,
  toMelhoriaDecision,
  type MelhoriaDecision,
} from "@/components/melhorias/melhoria-status";
import { AvaliarMelhoriaInfo } from "@/components/melhorias/avaliar-modal/avaliar-melhoria-info";
import {
  formatDataAprovado,
  formatHojeDisplay,
} from "@/components/melhorias/avaliar-modal/utils";

const JUSTIFICATIVA_MAX = 1000;
const JUSTIFICATIVA_MIN_RECUSA = 10;

interface AvaliarMelhoriaModalProps {
  open: boolean;
  item: PainelIdeiaItem | null;
  onOpenChange: (open: boolean) => void;
}

export function AvaliarMelhoriaModal({
  open,
  item,
  onOpenChange,
}: AvaliarMelhoriaModalProps) {
  const updateMelhoria = useUpdatePainelIdeia();
  const isPending = updateMelhoria.isPending;

  const [decision, setDecision] = useState<MelhoriaDecision | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [concluido, setConcluido] = useState<PainelIdeiaConcluido>("Não");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    setDecision(toMelhoriaDecision(item.status));
    setJustificativa(item.justificativa?.trim() ?? "");
    setConcluido(
      isMelhoriaAprovada(item.status) &&
        (item.concluido ?? "").trim().toLowerCase() === "sim"
        ? "Sim"
        : "Não",
    );
    setTouched(false);
  }, [open, item]);

  const isApprove = decision === "SIM";
  const isReject = decision === "NÃO";
  const justificativaLen = justificativa.length;
  const justificativaCurta =
    isReject && justificativa.trim().length < JUSTIFICATIVA_MIN_RECUSA;
  const showDecisionError = touched && !decision;
  const showJustError = touched && justificativaCurta;
  const jaAvaliada = item ? toMelhoriaDecision(item.status) != null : false;
  const userName = getUser()?.nome?.trim() || "";
  const hojeDisplay = formatHojeDisplay();

  const handleOpenChange = (next: boolean) => {
    if (isPending && !next) return;
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!item) return;
    if (!decision) {
      setTouched(true);
      return;
    }
    if (
      decision === "NÃO" &&
      justificativa.trim().length < JUSTIFICATIVA_MIN_RECUSA
    ) {
      setTouched(true);
      return;
    }
    if (!userName) {
      toast.error("Usuário não autenticado.");
      return;
    }

    const dataAprovado = formatDataAprovado();

    try {
      await updateMelhoria.mutateAsync({
        id: item.registro,
        data: {
          status: decision,
          concluido: decision === "NÃO" ? "Sim" : concluido,
          justificativa: justificativa.trim(),
          data_aprovado: dataAprovado,
          avaliado_por: userName,
        },
      });
      toast.success(
        `Melhoria #${item.registro} ${decision === "SIM" ? "aprovada" : "recusada"}`,
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao avaliar melhoria.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[min(96vw,720px)] max-w-[720px] flex-col gap-0 overflow-hidden border-border-divider p-0 sm:rounded-xl"
        onPointerDownOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-divider px-5 py-4 pr-12">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-base font-semibold leading-tight text-text-primary">
              {jaAvaliada ? "Reavaliar melhoria" : "Avaliar melhoria"}
            </DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">
              Registre a decisão sobre esta melhoria.
            </DialogDescription>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {item ? <AvaliarMelhoriaInfo item={item} /> : null}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-text-label">
              Decisão <span className="text-destructive">*</span>
            </span>
            <div className="inline-flex self-start gap-0.5 rounded-lg border border-border-divider bg-muted p-0.5">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => setDecision("SIM")}
                className={cn(
                  "h-8 px-5 shadow-none",
                  isApprove
                    ? "bg-panel-badge-fixed text-primary-foreground hover:bg-panel-badge-fixed/90"
                    : "bg-transparent text-text-secondary hover:bg-muted-foreground/10",
                )}
              >
                Aprovar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setDecision("NÃO");
                  setConcluido("Não");
                }}
                className={cn(
                  "h-8 px-5 shadow-none",
                  isReject
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-transparent text-text-secondary hover:bg-muted-foreground/10",
                )}
              >
                Recusar
              </Button>
            </div>
            {showDecisionError ? (
              <span className="text-xs text-destructive">
                Selecione Aprovar ou Recusar para registrar a avaliação.
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <Label
                htmlFor="melhoria-justificativa"
                className="text-sm font-semibold text-text-label"
              >
                Justificativa{" "}
                <span className="font-normal text-text-secondary">
                  {isReject ? "(obrigatória)" : "(opcional)"}
                </span>
              </Label>
              <span className="font-mono text-xs text-text-secondary">
                {justificativaLen}/{JUSTIFICATIVA_MAX}
              </span>
            </div>
            <Textarea
              id="melhoria-justificativa"
              rows={4}
              maxLength={JUSTIFICATIVA_MAX}
              disabled={isPending}
              value={justificativa}
              onChange={(event) =>
                setJustificativa(event.target.value.slice(0, JUSTIFICATIVA_MAX))
              }
              placeholder={
                isReject
                  ? "Ex.: Já existe o caso #97858 para implementar a rotina de desconto no Smart."
                  : "Opcional: contexto da aprovação, prioridade ou versão prevista."
              }
              className="min-h-24 resize-y text-sm"
            />
            {showJustError ? (
              <span className="text-xs text-destructive">
                {justificativaLen === 0
                  ? "Informe o motivo da recusa (mínimo 10 caracteres)."
                  : "A justificativa precisa de pelo menos 10 caracteres."}
              </span>
            ) : null}
          </div>

          {isApprove ? (
            <div className="flex max-w-[200px] flex-col gap-1.5">
              <Label className="text-sm font-semibold text-text-label">
                Concluído
              </Label>
              <Select
                value={concluido}
                onValueChange={(value) =>
                  setConcluido(value as PainelIdeiaConcluido)
                }
                disabled={isPending}
              >
                <SelectTrigger
                  aria-label="Concluído"
                  className="h-9 rounded-md border-border-input"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Não">Não</SelectItem>
                  <SelectItem value="Sim">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <span className="text-xs text-text-secondary">
            A avaliação será registrada como {userName || "—"} em {hojeDisplay}.
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border-divider bg-muted/30 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Registrando...
              </>
            ) : (
              "Registrar avaliação"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

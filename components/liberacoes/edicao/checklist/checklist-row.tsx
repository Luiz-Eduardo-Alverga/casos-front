"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Loader2,
  MessageSquarePlus,
  MessageSquareText,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { formatLiberacaoDateDisplay } from "@/components/liberacoes/utils";
import { cn } from "@/lib/utils";
import type { ChecklistRowState } from "@/components/liberacoes/edicao/checklist/utils";

interface ChecklistRowProps {
  item: ChecklistRowState;
  isUpdating?: boolean;
  disabled?: boolean;
  onToggleChecado: (checado: boolean) => void;
  onSaveObservacao: (observacao: string) => Promise<void> | void;
  onDelete: () => void;
}

export function ChecklistRow({
  item,
  isUpdating = false,
  disabled = false,
  onToggleChecado,
  onSaveObservacao,
  onDelete,
}: ChecklistRowProps) {
  const isBusy = isUpdating || disabled;
  const hasObservacao = Boolean(item.observacao.trim());
  const [editingObs, setEditingObs] = useState(false);
  const [draftObs, setDraftObs] = useState(item.observacao);
  const [savingObs, setSavingObs] = useState(false);

  useEffect(() => {
    if (!editingObs) {
      setDraftObs(item.observacao);
    }
  }, [item.observacao, editingObs]);

  const dataExibicao = formatLiberacaoDateDisplay(item.alteracaoDatahora);

  const handleStartEditObs = () => {
    setDraftObs(item.observacao);
    setEditingObs(true);
  };

  const handleCancelEditObs = () => {
    setDraftObs(item.observacao);
    setEditingObs(false);
  };

  const handleSaveObs = async () => {
    setSavingObs(true);
    try {
      await onSaveObservacao(draftObs);
      setEditingObs(false);
    } finally {
      setSavingObs(false);
    }
  };

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <label
              className={cn(
                "flex min-w-0 flex-1 items-start gap-3",
                isBusy || savingObs
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer",
              )}
            >
              <Checkbox
                checked={item.checado}
                onCheckedChange={(checked) => onToggleChecado(checked === true)}
                disabled={isBusy || savingObs}
                className={cn(
                  "mt-0.5 shrink-0",
                  item.checado &&
                    "border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white",
                )}
                aria-label={`Marcar item: ${item.descricaoItem}`}
              />
              <span
                className={cn(
                  "text-sm font-semibold leading-relaxed text-text-primary",
                  item.checado && "text-text-secondary line-through",
                )}
              >
                {item.descricaoItem || "—"}
              </span>
            </label>

            <div className="flex shrink-0 items-center gap-1">
              {/* <span className="px-1 font-mono text-[11.5px] text-text-secondary">
                #{item.idResponsavel}
              </span> */}

              {!editingObs ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={handleStartEditObs}
                  className={cn(
                    "h-7 gap-1 px-2 text-[12px]",
                    hasObservacao
                      ? "text-primary hover:bg-primary/10 hover:text-primary"
                      : "text-text-secondary hover:text-primary",
                  )}
                >
                  {hasObservacao ? (
                    <>
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Observação
                    </>
                  ) : (
                    <>
                      <MessageSquarePlus className="h-3.5 w-3.5" />+ Obs
                    </>
                  )}
                </Button>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isBusy || savingObs}
                onClick={onDelete}
                className="h-7 w-7 text-text-secondary hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Excluir item: ${item.descricaoItem}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-text-secondary">
            <span>{item.alteracaoUsuario || "—"}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
              {dataExibicao}
            </span>
          </p>

          {hasObservacao && !editingObs ? (
            <div className="w-full rounded-lg border-l-4 border-primary bg-muted/30 p-2.5 text-xs font-semibold leading-5 text-foreground whitespace-pre-wrap">
              {item.observacao}
            </div>
          ) : null}

          {editingObs ? (
            <div className="space-y-2">
              <Textarea
                value={draftObs}
                onChange={(e) => setDraftObs(e.target.value)}
                placeholder="Adicione uma observação (opcional)..."
                rows={3}
                className="min-h-[72px] resize-none overflow-hidden rounded-lg"
                disabled={savingObs || disabled}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingObs}
                  onClick={handleCancelEditObs}
                  className="min-w-[86px] rounded-lg"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={savingObs || disabled}
                  onClick={() => void handleSaveObs()}
                  className="min-w-[86px]"
                >
                  {savingObs ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

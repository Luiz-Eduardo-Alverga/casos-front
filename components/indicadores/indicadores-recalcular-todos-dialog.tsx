"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  IndicadoresRecalcularTodosDialogProps,
  RecalcularTodosLinha,
} from "./types";
import { formatMoney, formatUnidade, toTitleCase } from "./utils";

const STATUS_LABEL: Record<RecalcularTodosLinha["status"], string> = {
  fila: "Na fila",
  agora: "Agora",
  concluido: "Concluído",
  erro: "Erro",
};

function badgeClass(status: RecalcularTodosLinha["status"]) {
  if (status === "agora") return "bg-status-info/10 text-status-info";
  if (status === "concluido") return "bg-status-success/10 text-status-success";
  if (status === "erro") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

export function IndicadoresRecalcularTodosDialog({
  open,
  running,
  linhas,
  premiacao,
  onAtualizarTela,
  onClose,
}: IndicadoresRecalcularTodosDialogProps) {
  const total = linhas.length;
  const concluidos = linhas.filter((linha) => linha.status === "concluido").length;
  const erros = linhas.filter((linha) => linha.status === "erro").length;
  const atuais = linhas.filter((linha) => linha.status === "agora");
  const feitos = linhas.filter((linha) => linha.status !== "fila").length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  const okPct = total
    ? Math.round(((running ? concluidos + atuais.length : concluidos) / total) * 100)
    : 0;
  const errPct = total ? Math.round((erros / total) * 100) : 0;
  const atual = atuais[0];
  const done = open && !running && total > 0;

  const atualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    atualRef.current?.scrollIntoView({ block: "nearest" });
  }, [atual?.id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (running && !next) return;
        if (!next) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[calc(100vh-32px)] max-w-[600px] flex-col gap-0 overflow-hidden p-0",
          running && "[&>button.absolute]:hidden",
        )}
        onPointerDownOutside={(event) => {
          if (running) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (running) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (running) event.preventDefault();
        }}
      >
        <DialogHeader className="flex flex-row items-center space-y-0 gap-2 border-b border-border-divider p-4 pr-10 text-left">
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground",
              running && "animate-spin",
            )}
          />
          <DialogTitle className="flex-1 text-sm font-semibold">
            Recalculando indicadores
          </DialogTitle>
          <DialogDescription className="sr-only">
            Progresso do recálculo de todos os indicadores do período.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-foreground">
                Recalculando {feitos} de {total}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-1.5",
                  running ? "bg-status-info" : "bg-status-success",
                )}
                style={{ width: `${okPct}%` }}
              />
              <div
                className="h-1.5 bg-destructive"
                style={{ width: `${errPct}%` }}
              />
            </div>
            {running && atual ? (
              <p className="text-sm text-muted-foreground">
                Agora:{" "}
                <span className="font-semibold text-foreground">
                  {toTitleCase(atual.nomes)}
                </span>
              </p>
            ) : null}
            {done ? (
              <div className="flex items-start gap-2 pt-1">
                {erros > 0 ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {erros > 0
                      ? `${concluidos} recalculados · ${erros} com erro`
                      : `${concluidos} indicadores recalculados`}
                  </span>
                  {premiacao ? (
                    <span className="text-xs text-muted-foreground">
                      Premiação alcançada: {formatMoney(premiacao.alcancado)} de{" "}
                      {formatMoney(premiacao.potencial)}
                      {erros > 0
                        ? " · o indicador com erro não entra no fechamento."
                        : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative max-h-80 overflow-y-auto rounded-lg border border-border">
            <TooltipProvider delayDuration={200}>
            {linhas.map((linha, index) => {
              const area = toTitleCase(linha.area);
              return (
                <div
                  key={linha.id}
                  ref={linha.status === "agora" ? atualRef : undefined}
                  className={cn(
                    "flex flex-col items-start gap-1 px-4 py-2 sm:flex-row sm:items-center sm:gap-2",
                    index < linhas.length - 1 && "border-b border-border-divider",
                    linha.status === "agora" && "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold",
                      badgeClass(linha.status),
                    )}
                  >
                    {linha.status === "agora" ? (
                      <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    ) : null}
                    {STATUS_LABEL[linha.status]}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-sm text-pretty",
                      linha.status === "fila"
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {toTitleCase(linha.nomes)}
                    {area ? (
                      <span className="text-muted-foreground"> ({area})</span>
                    ) : null}
                  </span>
                  {linha.status === "concluido" && linha.valorIndicador != null ? (
                    <span className="shrink-0 text-xs whitespace-nowrap">
                      <span className="text-muted-foreground">Alcançado </span>
                      <span className="font-semibold text-foreground">
                        {formatUnidade(linha.valorIndicador, linha.unidade)}
                      </span>
                    </span>
                  ) : null}
                  {linha.status === "erro" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="shrink-0 cursor-help text-xs font-semibold text-destructive">
                          Falhou
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {linha.erroMensagem ?? "Erro ao recalcular indicador"}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              );
            })}
            </TooltipProvider>
          </div>
        </div>

        <DialogFooter className="border-t border-border-divider p-4 sm:justify-end">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={running}
            onClick={onAtualizarTela}
          >
            Atualizar tela
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

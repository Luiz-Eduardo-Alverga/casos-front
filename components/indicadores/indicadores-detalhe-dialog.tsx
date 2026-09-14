"use client";

import type { ReactNode } from "react";
import { Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIndicadorDetalhe } from "@/hooks/rh/use-indicador-detalhe";
import { cn } from "@/lib/utils";
import {
  culturaDotClass,
  displayOrFallback,
  formatMoney,
  isMaiorMelhor,
  toTitleCase,
  unidadeLabel,
} from "./utils";
import { IndicadoresMetricas, IndicadoresProgresso } from "./indicadores-item";
import type { IndicadoresDetalheDialogProps } from "./types";

export function IndicadoresDetalheDialog({
  item,
  open,
  onOpenChange,
  periodoLabel,
  isRecalculating,
  onRecalcular,
}: IndicadoresDetalheDialogProps) {
  const query = useIndicadorDetalhe(item?.indicador_id, {
    enabled: open && Boolean(item?.indicador_id),
  });
  const detalhe = query.data?.data;
  const TrendIcon = item && isMaiorMelhor(item) ? TrendingUp : TrendingDown;
  const trendClass = item?.alcancado
    ? "text-status-success"
    : "text-destructive";

  const formula = detalhe?.formula_metodo?.trim() ?? "";
  const observacao = detalhe?.observacao?.trim() ?? "";
  const showObservacao = Boolean(observacao && observacao !== formula);

  const registro = displayOrFallback(
    detalhe?.registro != null ? `#${detalhe.registro}` : "",
  );
  const tipo = displayOrFallback(toTitleCase(detalhe?.tipo_indicador));
  const periodicidade = displayOrFallback(toTitleCase(detalhe?.periodicidade));
  const unidade = displayOrFallback(
    detalhe ? unidadeLabel(detalhe.unidade || item?.unidade || "") : "",
  );
  const tendencia = displayOrFallback(
    item
      ? isMaiorMelhor(item)
        ? "Maior é melhor"
        : "Menor é melhor"
      : "",
  );
  const partes = displayOrFallback(detalhe?.partes_interessadas);
  const objetivo = displayOrFallback(toTitleCase(detalhe?.objetivo));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-48px)] max-w-[560px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 border-b border-border-divider p-4 pb-2 text-left">
          <DialogTitle className="pr-8 text-sm font-semibold text-pretty">
            {item?.nomes ?? "Detalhe do indicador"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Ficha e cálculo do indicador no período {periodoLabel}.
          </DialogDescription>
          {item ? (
            <span className="inline-flex h-5 w-fit items-center gap-2 rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  culturaDotClass(item.elementos_da_cultura),
                )}
              />
              {toTitleCase(item.elementos_da_cultura)}
            </span>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {item ? (
            <>
              <IndicadoresMetricas item={item} />
              <IndicadoresProgresso item={item} />
            </>
          ) : null}

          {query.isLoading ? <IndicadoresDetalheSkeleton /> : null}

          {query.error ? (
            <p className="mt-6 text-sm text-destructive" role="alert">
              {query.error instanceof Error
                ? query.error.message
                : "Não foi possível carregar o detalhe do indicador."}
            </p>
          ) : null}

          {detalhe ? (
            <div>
              <h3 className="mb-2 mt-6 text-xs font-semibold tracking-wide text-muted-foreground">
                COMO É CALCULADO
              </h3>
              <div className="flex flex-col gap-1">
                {formula ? (
                  <p className="text-xs leading-relaxed text-foreground text-pretty">
                    {formula}
                  </p>
                ) : null}
                <p className="text-xs leading-relaxed text-foreground text-pretty">
                  O cálculo roda sobre os registros do período filtrado (
                  {periodoLabel}) e considera apenas registros com vínculo ao
                  colaborador.
                </p>
                {item ? (
                  <p className="text-xs leading-relaxed text-foreground text-pretty">
                    {item.alcancado
                      ? `Meta atingida: o peso de ${formatMoney(item.peso)} já está garantido no fechamento do período.`
                      : `Meta não atingida: o peso de ${formatMoney(item.peso)} segue em aberto até o fechamento do período.`}
                  </p>
                ) : null}
              </div>

              <h3 className="mb-2 mt-6 text-xs font-semibold tracking-wide text-muted-foreground">
                FICHA DO INDICADOR
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <FichaCampo
                  label="Registro"
                  value={registro.text}
                  empty={registro.empty}
                  code={!registro.empty}
                />
                <FichaCampo
                  label="Tipo de indicador"
                  value={tipo.text}
                  empty={tipo.empty}
                />
                <FichaCampo
                  label="Periodicidade"
                  value={periodicidade.text}
                  empty={periodicidade.empty}
                />
                <FichaCampo
                  label="Unidade"
                  value={unidade.text}
                  empty={unidade.empty}
                />
                <FichaCampo
                  label="Critério de tendência"
                  value={tendencia.text}
                  empty={tendencia.empty}
                  icon={
                    !tendencia.empty ? (
                      <TrendIcon className={cn("h-3.5 w-3.5", trendClass)} />
                    ) : null
                  }
                />
                <FichaCampo
                  label="Partes interessadas"
                  value={partes.text}
                  empty={partes.empty}
                />
                <FichaCampo
                  label="Objetivo"
                  value={objetivo.text}
                  empty={objetivo.empty}
                  className="sm:col-span-2"
                />
              </div>

              {showObservacao ? (
                <div>
                  <h3 className="mb-2 mt-6 text-xs font-semibold tracking-wide text-muted-foreground">
                    OBSERVAÇÃO
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground text-pretty">
                    {observacao}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border-divider p-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={!item || isRecalculating}
            onClick={() => item && onRecalcular(item)}
          >
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recalcular
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FichaCampo({
  label,
  value,
  empty,
  code = false,
  icon,
  className,
}: {
  label: string;
  value: string;
  empty: boolean;
  code?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {code ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[13px] font-medium text-foreground">
            {value}
          </span>
        ) : (
          <span
            className={cn(
              "text-[13px] font-medium leading-snug text-pretty",
              empty ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {value}
          </span>
        )}
        {icon}
      </div>
    </div>
  );
}

function IndicadoresDetalheSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[92%]" />
        <Skeleton className="h-3 w-[64%]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CircleHelp, Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";
import {
  culturaDotClass,
  formatMeta,
  formatMoney,
  formatUnidade,
  isMaiorMelhor,
  itemTooltip,
  premioValor,
  toTitleCase,
} from "./utils";
import type { IndicadoresItemProps } from "./types";

export function IndicadoresMetricas({ item }: { item: ColaboradorIndicador }) {
  const valor = premioValor(item);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
      <span>
        <span className="text-muted-foreground">Alcançado </span>
        <span className="font-semibold text-foreground">
          {formatUnidade(item.saldo, item.unidade)}
        </span>
      </span>
      <span>
        <span className="text-muted-foreground">Meta </span>
        <span className="font-semibold text-foreground">{formatMeta(item)}</span>
      </span>
      <span>
        <span className="text-muted-foreground">Valor </span>
        <span
          className={cn(
            "font-semibold",
            valor > 0 ? "text-status-success" : "text-muted-foreground",
          )}
        >
          {formatMoney(valor)}
        </span>
      </span>
      <span>
        <span className="text-muted-foreground">Peso </span>
        <span className="font-semibold text-foreground">
          {formatMoney(item.peso)}
        </span>
      </span>
    </div>
  );
}

export function IndicadoresProgresso({ item }: { item: ColaboradorIndicador }) {
  const pct = Math.min(100, Math.max(0, item.perc_alc));
  const barClass = item.alcancado ? "bg-status-success" : "bg-destructive";
  const iconClass = item.alcancado
    ? "text-status-success"
    : "text-destructive";
  const TrendIcon = isMaiorMelhor(item) ? TrendingUp : TrendingDown;

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-1 rounded-full", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <TrendIcon className={cn("h-3.5 w-3.5 shrink-0", iconClass)} />
    </div>
  );
}

export function IndicadoresItem({
  item,
  showHoverRecalc = false,
  isRecalculating = false,
  onDetalhe,
  onRecalcular,
}: IndicadoresItemProps) {
  const [tipOpen, setTipOpen] = useState(false);
  const tooltip = itemTooltip(item);

  return (
    <div
      className={cn(
        "group relative border-t border-border-divider px-4 py-4 lg:px-6",
        "hover:bg-muted/40",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-semibold leading-snug text-foreground text-pretty">
              {item.nomes}
            </span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Ajuda do indicador"
                    onClick={() => setTipOpen((open) => !open)}
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="hidden max-w-xs bg-foreground text-xs text-background lg:block">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="inline-flex h-5 w-fit items-center gap-2 rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                culturaDotClass(item.elementos_da_cultura),
              )}
            />
            {toTitleCase(item.elementos_da_cultura)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showHoverRecalc ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              title="Recalcular indicador"
              className={
                isRecalculating ? undefined : "opacity-0 group-hover:opacity-100"
              }
              disabled={isRecalculating}
              onClick={() => onRecalcular(item)}
            >
              {isRecalculating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : null}
          {item.tem_detalhe ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onDetalhe(item)}
            >
              Detalhe
            </Button>
          ) : null}
        </div>
      </div>

      {tipOpen ? (
        <div className="mt-2 rounded-lg bg-foreground px-2 py-2 text-xs leading-snug text-background lg:hidden">
          {tooltip}
        </div>
      ) : null}

      <IndicadoresMetricas item={item} />
      <IndicadoresProgresso item={item} />
    </div>
  );
}

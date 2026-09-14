"use client";

import { AlertCircle, BarChart3, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";
import { IndicadoresItem } from "./indicadores-item";
import type { IndicadoresColunaProps } from "./types";

export function IndicadoresColuna({
  variant,
  items,
  somaLabel,
  recalculatingId,
  onDetalhe,
  onRecalcular,
}: IndicadoresColunaProps) {
  const isAlcancou = variant === "alcancou";
  const Icon = isAlcancou ? CheckCircle2 : AlertCircle;

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              isAlcancou ? "text-status-success" : "text-destructive",
            )}
          />
          <CardTitle className="text-sm font-semibold text-foreground">
            {isAlcancou ? "Alcançou" : "Resta"}
          </CardTitle>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2 text-xs font-semibold",
              isAlcancou
                ? "bg-status-success/10 text-status-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {items.length}
          </span>
          {somaLabel ? (
            <span className="ml-auto text-xs text-muted-foreground">
              {somaLabel}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Nenhum indicador no período"
            description="Ajuste as datas ou selecione outro colaborador."
          />
        ) : (
          items.map((item) => (
            <IndicadoresItem
              key={item.id}
              item={item}
              showHoverRecalc
              isRecalculating={recalculatingId === item.id}
              onDetalhe={onDetalhe}
              onRecalcular={onRecalcular}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

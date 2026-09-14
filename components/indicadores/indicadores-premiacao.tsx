"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "./utils";
import type { IndicadoresPremiacaoProps } from "./types";

export function IndicadoresPremiacao({
  premiacao,
  periodoLabel,
}: IndicadoresPremiacaoProps) {
  const pendentesLabel =
    premiacao.pendentes === 0
      ? "Nenhum indicador pendente"
      : `${premiacao.pendentes} indicadores pendentes`;

  return (
    <Card className="w-full shrink-0 overflow-hidden rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Premiação do período
          </CardTitle>
          <span className="ml-auto text-xs text-muted-foreground">
            {periodoLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-wide text-muted-foreground">
              POTENCIAL
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(premiacao.potencial)}
            </span>
            <span className="text-xs text-muted-foreground">
              Total do período
            </span>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-divider pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span className="text-xs tracking-wide text-muted-foreground">
              ALCANÇADO
            </span>
            <span className="text-2xl font-bold tracking-tight text-status-success">
              {formatMoney(premiacao.alcancado)}
            </span>
            <span className="text-xs text-muted-foreground">
              {premiacao.percentual}% da premiação
            </span>
          </div>
          <div className="flex flex-col gap-1 border-t border-border-divider pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span className="text-xs tracking-wide text-muted-foreground">
              EM ABERTO
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(premiacao.emAberto)}
            </span>
            <span className="text-xs text-muted-foreground">{pendentesLabel}</span>
          </div>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-status-success"
            style={{
              width: `${Math.min(100, Math.max(0, premiacao.percentual))}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

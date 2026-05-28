"use client";

import { BarChart3, CheckCircle2, Clock, Layers } from "lucide-react";
import { cn, formatMinutesToHHMM } from "@/lib/utils";

const STATIC_SUMMARY = {
  quantidade: "111",
  qtdPlanejada: "53",
  excedidoPlanejado: "13",
} as const;

function formatTempoTotalEstimadoRealizado(
  estimadoMinutos: number,
  realizadoMinutos: number,
): string {
  return `E: ${formatMinutesToHHMM(estimadoMinutos)} / R: ${formatMinutesToHHMM(realizadoMinutos)}`;
}

export interface EscopoSummaryCardsProps {
  tempoTotalEstimadoMinutos?: number;
  tempoTotalRealizadoMinutos?: number;
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: typeof Layers;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  className,
  iconClassName,
  labelClassName,
  valueClassName,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border-divider p-[13px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className={cn("text-xs text-muted-foreground", labelClassName)}>
          {label}
        </p>
        <p className={cn("text-sm font-bold text-text-primary", valueClassName)}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function EscopoSummaryCards({
  tempoTotalEstimadoMinutos = 0,
  tempoTotalRealizadoMinutos = 0,
}: EscopoSummaryCardsProps) {
  const tempoTotal = formatTempoTotalEstimadoRealizado(
    tempoTotalEstimadoMinutos,
    tempoTotalRealizadoMinutos,
  );

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-border-divider pb-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Quantidade"
        value={STATIC_SUMMARY.quantidade}
        icon={Layers}
        className="bg-muted/40"
        iconClassName="bg-blue-100 text-blue-700"
      />
      <SummaryCard
        label="Qtd. Planejada"
        value={STATIC_SUMMARY.qtdPlanejada}
        icon={CheckCircle2}
        className="bg-green-50 border-green-100"
        iconClassName="bg-green-100 text-green-700"
        labelClassName="text-green-800"
        valueClassName="text-green-900"
      />
      <SummaryCard
        label="Excedido Planejado"
        value={STATIC_SUMMARY.excedidoPlanejado}
        icon={BarChart3}
        className="bg-red-50 border-red-100"
        iconClassName="bg-red-100 text-red-700"
        labelClassName="text-red-700"
        valueClassName="text-red-800"
      />
      <SummaryCard
        label="Tempo Total"
        value={tempoTotal}
        icon={Clock}
        className="bg-sidebar-bg border-sidebar-border"
        iconClassName="bg-card text-text-primary"
        labelClassName="text-sidebar-text-secondary"
        valueClassName="text-sidebar-text"
      />
    </div>
  );
}

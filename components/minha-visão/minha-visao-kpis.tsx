"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, CalendarClock, Flag, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  sub: string;
  accentTextClassName: string;
  accentBgClassName: string;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  accentTextClassName,
  accentBgClassName,
}: KpiCardProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardContent className="p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            {label}
          </div>
          <div
            className={cn("text-2xl font-semibold mt-1 leading-none", accentTextClassName)}
          >
            {value}
          </div>
          <div className="text-xs text-text-secondary mt-1.5 truncate">{sub}</div>
        </div>
        <div
          className={cn(
            "h-9 w-9 rounded-lg grid place-items-center shrink-0",
            accentBgClassName,
            accentTextClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export interface MinhaVisaoKpisProps {
  casosProducaoTotal: number;
  casosParaTestarPendentes: number;
  casosParaTestarSubtitulo: string;
  prazosClientesTotal: number;
  proximasLiberacoesTotal: number;
  ultimasLiberacoesTotal: number;
}

export function MinhaVisaoKpis({
  casosProducaoTotal,
  casosParaTestarPendentes,
  casosParaTestarSubtitulo,
  prazosClientesTotal,
  proximasLiberacoesTotal,
  ultimasLiberacoesTotal,
}: MinhaVisaoKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <KpiCard
        label="Casos em Produção"
        value={casosProducaoTotal}
        icon={Activity}
        sub="Live feed · tempo real"
        accentTextClassName="text-orange-600"
        accentBgClassName="bg-orange-100"
      />
      <KpiCard
        label="Casos para Testar (QA)"
        value={casosParaTestarPendentes}
        icon={Users}
        sub={casosParaTestarSubtitulo}
        accentTextClassName="text-blue-600"
        accentBgClassName="bg-blue-100"
      />
      <KpiCard
        label="Prazos de Clientes"
        value={prazosClientesTotal}
        icon={Flag}
        sub="Acompanhamento crítico"
        accentTextClassName="text-red-600"
        accentBgClassName="bg-red-100"
      />
      <KpiCard
        label="Liberações (Próximas)"
        value={proximasLiberacoesTotal}
        icon={CalendarClock}
        sub={`${ultimasLiberacoesTotal} concluídas · últimos 60 dias`}
        accentTextClassName="text-green-600"
        accentBgClassName="bg-green-100"
      />
    </div>
  );
}

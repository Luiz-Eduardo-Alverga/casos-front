"use client";

import { Clock3, Code2, MessageCircleMore } from "lucide-react";
import type { HorasAnaliticasSummaryCardsProps } from "./types";
import {
  formatMinutesLabel,
  toSummaryCardValue,
} from "@/components/painel-kanban/horas-analiticas-modal/utils";

export function HorasAnaliticasSummaryCards({
  resumo,
}: HorasAnaliticasSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-lg border border-border-divider bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-text-secondary">
            Total técnico
          </p>
          <Code2 className="h-4 w-4 text-blue-500" aria-hidden />
        </div>
        <p className="text-2xl font-bold leading-none text-text-primary">
          {toSummaryCardValue(resumo.minutosTecnicos)}
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          {formatMinutesLabel(resumo.minutosTecnicos)}
        </p>
      </article>

      <article className="rounded-lg border border-border-divider bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-text-secondary">
            Não técnico
          </p>
          <MessageCircleMore className="h-4 w-4 text-emerald-500" aria-hidden />
        </div>
        <p className="text-2xl font-bold leading-none text-text-primary">
          {toSummaryCardValue(resumo.minutosNaoTecnicos)}
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          {formatMinutesLabel(resumo.minutosNaoTecnicos)}
        </p>
      </article>

      <article className="rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-300">
            Total geral
          </p>
          <Clock3 className="h-4 w-4 text-slate-200" aria-hidden />
        </div>
        <p className="text-2xl font-bold leading-none text-white">
          {toSummaryCardValue(resumo.minutosTotais)}
        </p>
        <p className="mt-2 text-xs text-slate-300">
          {resumo.totalCasos} {resumo.totalCasos === 1 ? "caso" : "casos"}{" "}
          trabalhados
        </p>
      </article>
    </div>
  );
}

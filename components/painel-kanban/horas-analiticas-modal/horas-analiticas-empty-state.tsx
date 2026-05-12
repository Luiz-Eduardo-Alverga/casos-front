"use client";

import {
  ChartColumnBig,
  ClipboardList,
  Filter,
  GitCommitHorizontal,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HorasAnaliticasEmptyStateProps } from "./types";

const EMPTY_STATE_CONTENT = {
  sem_filtros: {
    title: "Nenhum filtro selecionado",
    description:
      "Selecione uma data, produto ou colaborador nos filtros acima para visualizar as horas analíticas e os casos trabalhados.",
  },
  sem_resultados: {
    title: "Nenhum registro encontrado",
    description:
      "Não encontramos casos para os filtros aplicados. Ajuste os filtros e atualize para tentar novamente.",
  },
} as const;

export function HorasAnaliticasEmptyState({
  variant,
  onApplyFilters,
  isApplyFiltersDisabled = false,
}: HorasAnaliticasEmptyStateProps) {
  const content = EMPTY_STATE_CONTENT[variant];

  return (
    <section className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 shadow-sm md:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
          {variant === "sem_resultados" ? (
            <SearchX className="h-9 w-9 text-slate-500" aria-hidden />
          ) : (
            <Filter className="h-9 w-9 text-slate-500" aria-hidden />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-700">{content.title}</h3>
          <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">
            {content.description}
          </p>
        </div>

        <Button
          type="button"
          onClick={onApplyFilters}
          disabled={isApplyFiltersDisabled}
          className="bg-slate-800 text-white hover:bg-slate-700"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Aplicar Filtros
        </Button>

        <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
          <article className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-5">
            <ChartColumnBig
              className="mx-auto mb-2 h-5 w-5 text-slate-500"
              aria-hidden
            />
            <p className="text-xs text-slate-500">Visualize horas trabalhadas</p>
          </article>

          <article className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-5">
            <ClipboardList
              className="mx-auto mb-2 h-5 w-5 text-slate-500"
              aria-hidden
            />
            <p className="text-xs text-slate-500">
              Acompanhe casos em andamento
            </p>
          </article>

          <article className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-5">
            <GitCommitHorizontal
              className="mx-auto mb-2 h-5 w-5 text-slate-500"
              aria-hidden
            />
            <p className="text-xs text-slate-500">
              Gere commits dos casos trabalhados
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

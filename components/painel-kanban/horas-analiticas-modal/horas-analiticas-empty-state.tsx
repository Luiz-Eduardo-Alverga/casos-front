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
    <section className="rounded-xl border-2 border-dashed border-border bg-card p-8 shadow-sm md:p-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          {variant === "sem_resultados" ? (
            <SearchX className="h-9 w-9 text-muted-foreground" aria-hidden />
          ) : (
            <Filter className="h-9 w-9 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{content.title}</h3>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
            {content.description}
          </p>
        </div>

        <Button
          type="button"
          onClick={onApplyFilters}
          disabled={isApplyFiltersDisabled}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Aplicar Filtros
        </Button>

        <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
          <article className="rounded-lg border border-border bg-muted/50 px-4 py-5">
            <ChartColumnBig
              className="mx-auto mb-2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">Visualize horas trabalhadas</p>
          </article>

          <article className="rounded-lg border border-border bg-muted/50 px-4 py-5">
            <ClipboardList
              className="mx-auto mb-2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">
              Acompanhe casos em andamento
            </p>
          </article>

          <article className="rounded-lg border border-border bg-muted/50 px-4 py-5">
            <GitCommitHorizontal
              className="mx-auto mb-2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">
              Gere commits dos casos trabalhados
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

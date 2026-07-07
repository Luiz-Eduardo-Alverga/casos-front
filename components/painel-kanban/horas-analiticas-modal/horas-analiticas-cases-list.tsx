"use client";

import { Clock3, Hourglass, Package, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HorasAnaliticasCasesListProps } from "./types";
import { formatMinutesCompact } from "./utils";
import Link from "next/link";
import { buildCasoHrefForNewTab } from "@/lib/caso-standalone-url";

function getTarefaTecnicaBadgeClass(tarefaTecnica: boolean): string {
  if (tarefaTecnica) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/40";
  }
  return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/40";
}

function getTarefaTecnicaLabel(tarefaTecnica: boolean): string {
  return tarefaTecnica ? "Técnico" : "Não técnico";
}

export function HorasAnaliticasCasesList({
  casos,
}: HorasAnaliticasCasesListProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border-divider bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Casos Trabalhados Hoje
        </h3>
        <p className="text-xs text-text-secondary">
          {casos.length} {casos.length === 1 ? "registro" : "registros"}
        </p>
      </header>

      <div className="max-h-[280px] overflow-y-auto">
        {casos.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">
            Nenhum caso encontrado para os filtros selecionados.
          </div>
        ) : (
          casos.map((caso, index) => (
            <article
              key={caso.id + index.toString()}
              className="border-b border-border-divider px-4 py-3 last:border-b-0"
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">
                      #{caso.registro}
                    </p>
                    <Badge
                      className={`h-5 rounded px-2 text-[10px] uppercase ${getTarefaTecnicaBadgeClass(caso.tarefa_tecnica)}`}
                    >
                      {getTarefaTecnicaLabel(caso.tarefa_tecnica)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-tight text-text-primary">
                    {caso.descricaoResumo}
                  </p>
                </div>

                <Link
                  target="_blank"
                  href={buildCasoHrefForNewTab(caso.registro)}
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Editar caso ${caso.registro}`}
                >
                  <SquarePen className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1 text-text-primary font-semibold">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {caso.horaAbertura} - {caso.horaFechamento}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-text-secondary">
                  <Hourglass className="h-3.5 w-3.5" aria-hidden />
                  {formatMinutesCompact(caso.minutosRealizados)}
                </span>
                <span className="inline-flex items-center gap-1 text-text-secondary">
                  <Package className="h-3.5 w-3.5" aria-hidden />
                  {caso.produtoVersao}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import { getPrioridadeStyle } from "../utils";
import type { ReportListaGrupo } from "../filtros/reports-filtros-locais";
import {
  ReportsListaNextPageSkeleton,
  ReportsListaSkeleton,
} from "./reports-lista-skeleton";
import { ReportListaRow } from "./report-lista-row";

interface ReportsListaProps {
  grupos: ReportListaGrupo[];
  isLoading: boolean;
  hasSetor: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  loadMoreRef: React.Ref<HTMLDivElement>;
  onAprovar: (item: ReportListaGrupo["itens"][number]) => void;
  onMarcarIncompleto: (item: ReportListaGrupo["itens"][number]) => void;
  onSuspender: (item: ReportListaGrupo["itens"][number]) => void;
}

function grupoDotClass(id: string): string {
  if (id === "vencido" || id === "critico") return getPrioridadeStyle("Crítico").badgeDot;
  if (id === "urgente" || id === "alto") return getPrioridadeStyle("Alto").badgeDot;
  if (id === "medio") return getPrioridadeStyle("Médio").badgeDot;
  if (id === "baixo") return getPrioridadeStyle("Baixo").badgeDot;
  return "bg-muted-foreground";
}

export function ReportsLista({
  grupos,
  isLoading,
  hasSetor,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  loadMoreRef,
  onAprovar,
  onMarcarIncompleto,
  onSuspender,
}: ReportsListaProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <ReportsListaSkeleton />;
  }

  if (!hasSetor) {
    return (
      <EmptyState
        icon={Inbox}
        title="Selecione um setor"
        description="Escolha um setor no filtro para visualizar os reports abertos."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {grupos.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhum report encontrado"
          description="Ajuste os filtros ou não há reports abertos no momento."
        />
      ) : (
        grupos.map((grupo) => (
          <section key={grupo.id} className="flex flex-col">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <span
                className={`size-2 rounded-full ${grupoDotClass(grupo.id)}`}
                aria-hidden
              />
              {grupo.label}
              <span className="text-muted-foreground">{grupo.itens.length}</span>
            </h3>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
              {grupo.itens.map((item) => {
                const id = item.caso.id;
                return (
                  <ReportListaRow
                    key={id}
                    item={item}
                    open={expanded.has(id)}
                    disabled={isPending}
                    onToggle={() => toggle(id)}
                    onAprovar={() => onAprovar(item)}
                    onMarcarIncompleto={() => onMarcarIncompleto(item)}
                    onSuspender={() => onSuspender(item)}
                    onVerCaso={() =>
                      window.open(
                        buildCasoEditHref(id, "case", { standalone: true }),
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  />
                );
              })}
            </div>
          </section>
        ))
      )}

      {isFetchingNextPage ? <ReportsListaNextPageSkeleton count={3} /> : null}

      {hasNextPage ? <div ref={loadMoreRef} className="min-h-[48px]" /> : null}
    </div>
  );
}

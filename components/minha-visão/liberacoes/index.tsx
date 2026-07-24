"use client";

import { CalendarClock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { TipoLiberacaoBadge } from "./tipo-liberacao-badge";
import { LiberacoesSkeleton } from "./liberacoes-skeleton";
import type { VisaoProximasLiberacoesItem } from "@/services/sprint/get-visao-proximas-liberacoes";
import type { VisaoUltimasLiberacoesItem } from "@/services/sprint/get-visao-ultimas-liberacoes";

interface LiberacoesProps {
  proximas: VisaoProximasLiberacoesItem[];
  concluidas: VisaoUltimasLiberacoesItem[];
  isLoading?: boolean;
}

export function Liberacoes({ proximas, concluidas, isLoading = false }: LiberacoesProps) {
  if (isLoading) {
    return <LiberacoesSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center gap-2 space-y-0">
        <CalendarClock className="h-3.5 w-3.5 text-text-primary shrink-0" />
        <CardTitle className="text-sm font-semibold text-text-primary">
          Pipeline de liberações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Próximas liberações
          </span>
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-text-secondary">
            {proximas.length}
          </span>
        </div>
        {proximas.length === 0 ? (
          <EmptyState
            title="Nenhuma liberação prevista"
            description="Não há próximas liberações com os filtros selecionados."
            className="py-6"
          />
        ) : (
          <div className="px-4 pb-2 space-y-2">
            {proximas.map((item, idx) => (
              <div
                key={`${item.registro}-${idx}`}
                className="px-3.5 py-2.5 rounded-lg border border-border-divider bg-muted/30 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">
                    {item.produto}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    v{item.versao} · Previsão:{" "}
                    {item.data || item.versao_final_data_prevista || "—"}
                  </div>
                </div>
                <TipoLiberacaoBadge tipo={item.tipo_liberacao} />
              </div>
            ))}
          </div>
        )}

        <div className="px-4 pt-2 pb-1 flex items-center justify-between border-t border-border-divider">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-green-600 mt-2">
            Liberações concluídas (60 dias)
          </span>
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-text-secondary mt-2">
            {concluidas.length}
          </span>
        </div>
        {concluidas.length === 0 ? (
          <div className="px-4 py-4 text-center text-xs text-text-secondary">
            Nenhuma liberação concluída no período.
          </div>
        ) : (
          <div className="max-h-[180px] overflow-y-auto pb-1">
            {concluidas.map((item, idx) => (
              <div
                key={`${item.registro}-${idx}`}
                className="px-4 py-2 flex items-center justify-between gap-2"
              >
                <div className="text-xs text-text-primary truncate">
                  {item.produto} <span className="text-text-secondary">(v{item.versao})</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-text-secondary">{item.data}</span>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { LiberacoesSkeleton } from "./liberacoes-skeleton";

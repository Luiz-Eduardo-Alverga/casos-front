"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CalendarClock, Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/painel/empty-state";
import { CasosFiltrosAnimatedContent } from "@/components/casos/filtros/casos-filtros-animated-content";
import { cn } from "@/lib/utils";
import { TipoLiberacaoBadge } from "./tipo-liberacao-badge";
import { LiberacoesSkeleton } from "./liberacoes-skeleton";
import type {
  TipoLiberacao,
  VisaoProximasLiberacoesItem,
} from "@/services/sprint/get-visao-proximas-liberacoes";
import type { VisaoUltimasLiberacoesItem } from "@/services/sprint/get-visao-ultimas-liberacoes";

export type TipoLiberacaoFiltro = TipoLiberacao | "todos";

const TIPO_LIBERACAO_OPTIONS: Array<{
  value: TipoLiberacaoFiltro;
  label: string;
}> = [
  { value: "todos", label: "Todos" },
  { value: "Release", label: "Release" },
  { value: "Hotfix", label: "Hotfix" },
];

interface LiberacoesProps {
  proximas: VisaoProximasLiberacoesItem[];
  concluidas: VisaoUltimasLiberacoesItem[];
  tipoLiberacao: TipoLiberacaoFiltro;
  onTipoLiberacaoChange: (value: TipoLiberacaoFiltro) => void;
  isLoading?: boolean;
}

export function Liberacoes({
  proximas,
  concluidas,
  tipoLiberacao,
  onTipoLiberacaoChange,
  isLoading = false,
}: LiberacoesProps) {
  const [concluidasOpen, setConcluidasOpen] = useState(false);

  if (isLoading) {
    return <LiberacoesSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-4 pb-2 border-b border-border-divider flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarClock className="h-3.5 w-3.5 text-text-primary shrink-0" />
          <CardTitle className="text-sm font-semibold text-text-primary truncate">
            Pipeline de liberações
          </CardTitle>
        </div>
        <Select
          value={tipoLiberacao}
          onValueChange={(value) =>
            onTipoLiberacaoChange(value as TipoLiberacaoFiltro)
          }
        >
          <SelectTrigger className="h-8 w-[120px] rounded-lg border border-input bg-background px-3 shadow-sm text-xs font-medium">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            {TIPO_LIBERACAO_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Próximas liberações
          </span>
        </div>
        {proximas.length === 0 ? (
          <EmptyState
            title="Nenhuma liberação prevista"
            description="Não há próximas liberações com os filtros selecionados."
            className="py-6"
          />
        ) : (
          <div className="max-h-[312px] overflow-y-auto px-4 pb-2 space-y-2">
            {proximas.map((item, idx) => (
              <div
                key={`${item.registro}-${idx}`}
                className="px-3.5 py-2.5 rounded-lg border border-border-divider bg-muted/30 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">
                    v{item.versao} · Previsão:{" "}
                    {item.data || item.versao_final_data_prevista || "—"}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    {item.produto}
                  </div>
                </div>
                <TipoLiberacaoBadge tipo={item.tipo_liberacao} />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          aria-expanded={concluidasOpen}
          onClick={() => setConcluidasOpen((open) => !open)}
          className="w-full px-4 pt-2 pb-1 flex items-center justify-between border-t border-border-divider text-left mb-2"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wide text-green-600 mt-2">
            Liberações concluídas (60 dias)
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-green-600 mt-2 shrink-0 transition-transform duration-200",
              concluidasOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        <AnimatePresence initial={false}>
          {concluidasOpen ? (
            <CasosFiltrosAnimatedContent
              mode="edicao"
              className="overflow-hidden"
            >
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
                        {item.produto}{" "}
                        <span className="text-text-secondary">
                          (v{item.versao})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-text-secondary">
                          {item.data}
                        </span>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CasosFiltrosAnimatedContent>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export { LiberacoesSkeleton } from "./liberacoes-skeleton";

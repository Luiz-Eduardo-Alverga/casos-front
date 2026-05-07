"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { PainelKanbanAgendaCardsField } from "@/components/painel-kanban/filtros/painel-kanban-agenda-cards-field";

export type { PainelKanbanFiltrosForm };

interface PainelKanbanFiltrosProps {
  /** Itens da agenda do desenvolvedor (`useAgendaDev`); seleção de produto/versão vem daqui. */
  agendaItems: AgendaDevItem[];
}

export function PainelKanbanFiltros({ agendaItems }: PainelKanbanFiltrosProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6 min-w-0">
      <CardHeader className="px-5 py-4 border-b border-border-divider shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Visão geral de Produtos Priorizados
            </CardTitle>
          </div>
          <p className="text-xs text-text-secondary">
            Selecione um produto abaixo para filtrar os dados do Kanban
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 sm:p-6 sm:pt-3 min-w-0">
        <PainelKanbanAgendaCardsField agendaItems={agendaItems} />
      </CardContent>
    </Card>
  );
}

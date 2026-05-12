"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { PainelKanbanAgendaCardsField } from "@/components/painel-kanban/filtros/painel-kanban-agenda-cards-field";
import { CasoFormProjeto } from "@/components/fields";

export type { PainelKanbanFiltrosForm };

interface PainelKanbanFiltrosProps {
  /** Itens da agenda do desenvolvedor (`useAgendaDev`); seleção de produto/versão vem daqui. */
  agendaItems: AgendaDevItem[];
  /** Usuário selecionado no filtro "Ver como", usado para buscar projetos. */
  usuarioId?: string;
}

export function PainelKanbanFiltros({
  agendaItems,
  usuarioId,
}: PainelKanbanFiltrosProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6 min-w-0">
      <CardHeader className="px-5 py-3 border-b border-border-divider shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Visão geral de Produtos Priorizados
            </CardTitle>
          </div>
          <CasoFormProjeto
            requireProduto={false}
            usuarioId={usuarioId}
            setorProjetoFieldName="devAtribuidoSetor"
            requireSetorProjeto
            autoSelectProjeto="always"
            loadingFieldName="projetoLoading"
            required={false}
            hideLabel
            valueLabelPrefix="Projeto: "
            wrapperClassName="w-full sm:w-[260px] h-full"
            controlHeightClassName="h-[32px]"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 sm:p-6 sm:pt-3 min-w-0">
        <PainelKanbanAgendaCardsField agendaItems={agendaItems} />
      </CardContent>
    </Card>
  );
}

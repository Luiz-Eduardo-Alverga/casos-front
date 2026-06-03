"use client";

import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { PainelKanbanAgendaCardsField } from "@/components/painel-kanban/filtros/painel-kanban-agenda-cards-field";
import { CasoFormProjeto } from "@/components/fields";
import type { Projeto } from "@/services/auxiliar/projetos";

export type { PainelKanbanFiltrosForm };

interface PainelKanbanFiltrosProps {
  agendaItems: AgendaDevItem[];
  /** Projetos carregados no container (uma única requisição, sem setor na API). */
  projetos?: Projeto[];
  projetosLoading?: boolean;
}

export function PainelKanbanFiltros({
  agendaItems,
  projetos,
  projetosLoading = false,
}: PainelKanbanFiltrosProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg shrink-0 mb-2 min-w-0">
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
            requireSetorProjeto={false}
            useExternalProjetos
            projetosExternos={projetos}
            projetosLoadingExterno={projetosLoading}
            omitSetorProjetoInRequest
            autoSelectProjeto="never"
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

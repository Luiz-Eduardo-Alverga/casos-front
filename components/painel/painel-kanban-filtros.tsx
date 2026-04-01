"use client";

import { useMemo } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CasoFormProvider, CasoFormDevAtribuido } from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import {
  PainelKanbanAgendaProdutoField,
  PainelKanbanAgendaVersaoField,
} from "@/components/painel/painel-kanban-agenda-fields";
import type { PainelKanbanFiltrosForm } from "@/components/painel/painel-kanban-filtros-form";

export type { PainelKanbanFiltrosForm };

interface PainelKanbanFiltrosProps {
  methods: UseFormReturn<PainelKanbanFiltrosForm>;
  /** Itens da agenda do desenvolvedor (`useAgendaDev`); produto e versão vêm apenas daqui. */
  agendaItems: AgendaDevItem[];
}

export function PainelKanbanFiltros({
  methods,
  agendaItems,
}: PainelKanbanFiltrosProps) {
  const produto = methods.watch("produto");

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
      lazyLoadComboboxOptions: true,
    }),
    [methods, produto],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-w-0">
                <PainelKanbanAgendaProdutoField agendaItems={agendaItems} />
                <PainelKanbanAgendaVersaoField agendaItems={agendaItems} />
                {/* <CasoFormDevAtribuido
                  required={false}
                  requireProduto={false}
                  label="Responsável"
                  placeholder="Selecione o responsável..."
                /> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}

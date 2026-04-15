"use client";

import { useMemo } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { Filter, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CasoFormProvider, CasoFormDevAtribuido } from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import { PainelKanbanAgendaProdutoField } from "@/components/painel-kanban/fields/kanban-agenda-produto-field";
import { PainelKanbanAgendaVersaoField } from "@/components/painel-kanban/fields/kanban-agenda-versao-field";
import { Button } from "@/components/ui/button";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";

export type { PainelKanbanFiltrosForm };

interface PainelKanbanFiltrosProps {
  methods: UseFormReturn<PainelKanbanFiltrosForm>;
  /** Itens da agenda do desenvolvedor (`useAgendaDev`); produto e versão vêm apenas daqui. */
  agendaItems: AgendaDevItem[];
  onEditarQuadroClick: () => void;
}

export function PainelKanbanFiltros({
  methods,
  agendaItems,
  onEditarQuadroClick,
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
          <CardHeader className="px-5 py-2 border-b border-border-divider shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-text-primary" />
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Filtros
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end flex-1 min-w-0">
                <div className="col-span-2">
                  <CasoFormDevAtribuido
                    required={false}
                    requireProduto={false}
                    label="Ver como"
                    placeholder="Selecione a pessoa que deseja ver..."
                  />
                </div>

                <div className="col-span-2">
                  <PainelKanbanAgendaProdutoField agendaItems={agendaItems} />
                </div>

                <div className="col-span-2">
                  <PainelKanbanAgendaVersaoField agendaItems={agendaItems} />
                </div>

                <Button
                  type="button"
                  className="h-9"
                  onClick={onEditarQuadroClick}
                >
                  <Pencil className="h-3.5 w-3.5 " />
                  Editar Quadro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}

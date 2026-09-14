"use client";

import { FormProvider } from "react-hook-form";
import { ListFilter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { cn } from "@/lib/utils";
import type { IndicadorAtalho, IndicadoresFiltrosProps } from "./types";

const ATALHOS_BASE: Array<{ id: IndicadorAtalho; label: string }> = [
  { id: "mes-anterior", label: "Mês anterior" },
  { id: "mes-atual", label: "Mês atual" },
];

export function IndicadoresFiltros({
  form,
  dataInicial,
  dataFinal,
  onDataInicialChange,
  onDataFinalChange,
  canViewOthers,
  atalho,
  onAtalho,
}: IndicadoresFiltrosProps) {
  return (
    <Card className="w-full shrink-0 overflow-hidden rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <ListFilter className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Filtros
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <CasoFormProvider
          value={{
            form,
            importanceOptions: [],
            isDisabled: false,
            lazyLoadComboboxOptions: true,
          }}
        >
          <FormProvider {...form}>
            <div
              className={cn(
                "mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2",
                canViewOthers ? "lg:grid-cols-3" : "lg:grid-cols-2",
              )}
            >
              <DatePickerInput
                id="indicadores-data-inicial"
                label="Data inicial"
                value={dataInicial}
                onChange={onDataInicialChange}
                controlHeightClassName="h-9"
              />
              <DatePickerInput
                id="indicadores-data-final"
                label="Data final"
                value={dataFinal}
                onChange={onDataFinalChange}
                controlHeightClassName="h-9"
              />
              {canViewOthers ? (
                <CasoFormDevAtribuido
                  name="devAtribuido"
                  labelName="devAtribuidoLabel"
                  label="Colaborador"
                  placeholder="Selecione o colaborador..."
                  required={false}
                  requireProduto={false}
                  controlHeightClassName="h-9"
                />
              ) : null}
            </div>
          </FormProvider>
        </CasoFormProvider>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(canViewOthers
            ? [
                ...ATALHOS_BASE,
                { id: "so-o-meu" as const, label: "Só o meu" },
              ]
            : ATALHOS_BASE
          ).map((item) => {
            const isActive = atalho === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onAtalho(item.id)}
                className={cn(
                  "h-6 rounded-lg px-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

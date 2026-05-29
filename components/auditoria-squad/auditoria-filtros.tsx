"use client";

import { ClipboardList, Sparkles } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { importanceOptions } from "@/mocks/teste";
import { cn } from "@/lib/utils";
import type { AuditoriaFiltrosProps } from "./types";
import type { UseFormReturn } from "react-hook-form";
import type { AuditoriaFiltersForm } from "./types";

interface AuditoriaFiltrosCardProps extends AuditoriaFiltrosProps {
  form: UseFormReturn<AuditoriaFiltersForm>;
}

export function AuditoriaFiltros({
  form,
  dataProducao,
  onDataProducaoChange,
  canAuditAllUsers,
  canAudit,
  isFetching,
  onAuditar,
}: AuditoriaFiltrosCardProps) {
  return (
    <Card className="w-full shrink-0 overflow-hidden rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-5 pb-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Filtros
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <CasoFormProvider
          value={{
            form,
            importanceOptions,
            isDisabled: !canAuditAllUsers,
            lazyLoadComboboxOptions: true,
          }}
        >
          <FormProvider {...form}>
            <div
              className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 items-end",
                canAuditAllUsers ? "lg:grid-cols-4" : "lg:grid-cols-3",
              )}
            >
              <DatePickerInput
                id="auditoria-data"
                label="Data"
                value={dataProducao}
                onChange={onDataProducaoChange}
                controlHeightClassName="h-9"
              />

              {canAuditAllUsers ? (
                <CasoFormProjeto
                  requireProduto={false}
                  autoSelectProjeto="never"
                  required={false}
                  controlHeightClassName="h-9"
                />
              ) : null}

              <CasoFormDevAtribuido
                name="devAtribuido"
                labelName="devAtribuidoLabel"
                label="Colaborador"
                required={false}
                requireProduto={false}
                controlHeightClassName="h-9"
              />

              <div className="space-y-2">
                <Label
                  className="pointer-events-none select-none text-sm font-medium text-transparent"
                  aria-hidden
                >
                  Ação
                </Label>
                <Button
                  type="button"
                  onClick={onAuditar}
                  disabled={!canAudit || isFetching}
                  className="h-9 w-full bg-gradient-to-r from-gradient-start to-gradient-end px-4 text-white hover:opacity-90"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auditar Squad agora
                </Button>
              </div>
            </div>
          </FormProvider>
        </CasoFormProvider>
      </CardContent>
    </Card>
  );
}

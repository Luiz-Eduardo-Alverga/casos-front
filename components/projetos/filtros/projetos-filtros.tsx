"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormSgpObjetivo } from "@/components/fields/caso-form-sgp-objetivo";
import { importanceOptions } from "@/mocks/teste";
import { Filter, Search } from "lucide-react";
import type { ProjetosFiltrosAplicados } from "@/components/projetos/filtros/projetos-filtros.types";
import type { ProjetosFiltersForm } from "@/components/projetos/filtros/projetos-filtros.types";
import { EMPTY_PROJETOS_FILTERS_FORM } from "@/components/projetos/filtros/projetos-filtros.types";
import {
  filtrosQueryKey,
  filtrosToFormDefaults,
  formToFiltrosAplicados,
  hasFiltersApplied,
} from "@/components/projetos/filtros/projetos-filtros-mappers";

interface ProjetosFiltrosProps {
  filtrosAplicados: ProjetosFiltrosAplicados;
  onAplicar: (filtros: ProjetosFiltrosAplicados) => void;
}

export function ProjetosFiltros({
  filtrosAplicados,
  onAplicar,
}: ProjetosFiltrosProps) {
  const appliedQueryKey = filtrosQueryKey(filtrosAplicados);

  const methods = useForm<ProjetosFiltersForm>({
    defaultValues: EMPTY_PROJETOS_FILTERS_FORM,
  });

  const lastFormSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastFormSyncKeyRef.current === appliedQueryKey) return;
    lastFormSyncKeyRef.current = appliedQueryKey;
    methods.reset(filtrosToFormDefaults(filtrosAplicados));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey agrega deps; `methods` é estável
  }, [appliedQueryKey, filtrosAplicados]);

  const handleFiltrar = useCallback(() => {
    onAplicar(formToFiltrosAplicados(methods.getValues()));
  }, [methods, onAplicar]);

  const formValues = methods.watch();
  const canFiltrar = useMemo(
    () => hasFiltersApplied(formToFiltrosAplicados(formValues)),
    [formValues],
  );

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: "",
      isDisabled: false,
    }),
    [methods],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="flex flex-row justify-between px-5 py-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Id do Projeto
                </Label>
                <Input
                  placeholder="Busque pelo Id do projeto..."
                  className="h-9 rounded-lg border-border-input"
                  {...methods.register("registro")}
                />
              </div>

              <CasoFormSetor required={false} />

              <CasoFormSgpObjetivo required={false} />

              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <Button
                  type="button"
                  onClick={handleFiltrar}
                  disabled={!canFiltrar}
                  className="w-full px-4 h-9"
                >
                  <Search className="h-3.5 w-3.5 mr-2" />
                  <span>Filtrar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}

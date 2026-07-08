"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Filter, Search } from "lucide-react";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LISTAGEM_CARD_STACK_GAP } from "@/components/layout/listagem-page-layout";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import type { Categoria } from "@/services/auxiliar/categorias";
import { importanceOptions } from "@/mocks/teste";
import {
  filtrosQueryKey,
  filtrosToFormDefaults,
  formToFiltrosAplicados,
  hasFiltersApplied,
} from "@/components/reports/filtros/reports-filtros-mappers";
import type { ReportsFiltersForm, ReportsFiltrosAplicados } from "./types";
import { DEFAULT_REPORTS_STATUS_IDS } from "./types";

interface ReportsFiltrosProps {
  filtrosAplicados: ReportsFiltrosAplicados;
  onAplicar: (filtros: ReportsFiltrosAplicados) => void;
}

export function ReportsFiltros({
  filtrosAplicados,
  onAplicar,
}: ReportsFiltrosProps) {
  const queryClient = useQueryClient();
  const appliedQueryKey = filtrosQueryKey(filtrosAplicados);

  const methods = useForm<ReportsFiltersForm>({
    defaultValues: {
      setor: "",
      produto: "",
      categoria: "",
      status_ids: [...DEFAULT_REPORTS_STATUS_IDS],
    },
  });

  const produto = methods.watch("produto");
  const categoriaForm = methods.watch("categoria");
  const needsCategoriasCatalog =
    Boolean(filtrosAplicados.tipo_categoria?.trim()) ||
    Boolean(String(categoriaForm ?? "").trim());
  const { data: categorias } = useCategorias({
    enabled: needsCategoriasCatalog,
  });

  const categoriasSyncKey = useMemo(
    () => (categorias ?? []).map((c) => c.id).join(","),
    [categorias],
  );

  const getCategoriasForMapper = useCallback((): Categoria[] => {
    return (
      categorias ??
      queryClient.getQueryData<Categoria[]>(["categorias", ""]) ??
      []
    );
  }, [categorias, queryClient]);

  const lastFormSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncKey = `${appliedQueryKey}|${categoriasSyncKey}`;
    if (lastFormSyncKeyRef.current === syncKey) return;
    lastFormSyncKeyRef.current = syncKey;
    methods.reset(
      filtrosToFormDefaults(filtrosAplicados, getCategoriasForMapper()),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey agrega deps; `methods` é estável
  }, [
    appliedQueryKey,
    categoriasSyncKey,
    filtrosAplicados,
    getCategoriasForMapper,
  ]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
    }),
    [methods, produto],
  );

  const handleFiltrar = useCallback(() => {
    onAplicar(
      formToFiltrosAplicados(methods.getValues(), getCategoriasForMapper()),
    );
  }, [methods, onAplicar, getCategoriasForMapper]);

  const formValues = methods.watch();
  const canFiltrar = useMemo(
    () =>
      hasFiltersApplied(
        formToFiltrosAplicados(formValues, getCategoriasForMapper()),
      ),
    [formValues, getCategoriasForMapper],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card
          className={`bg-card shadow-card rounded-lg shrink-0 ${LISTAGEM_CARD_STACK_GAP} overflow-hidden`}
        >
          <CardHeader className="flex flex-row items-center justify-between px-5 py-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
              <div className="min-w-0">
                <CasoFormSetor />
              </div>
              <div className="min-w-0">
                <CasoFormProduto required={false} />
              </div>
              <div className="min-w-0">
                <CasoFormCategoria required={false} />
              </div>
              <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                <Controller
                  name="status_ids"
                  control={methods.control}
                  render={({ field }) => (
                    <StatusMultiSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <Button
                type="button"
                onClick={handleFiltrar}
                disabled={!canFiltrar}
                className="h-9 flex-1 sm:flex-initial sm:col-span-2 lg:col-span-1"
              >
                <Search className="h-3.5 w-3.5 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}

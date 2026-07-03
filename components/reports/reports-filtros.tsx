"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Filter, Search, FilterX } from "lucide-react";
import { MAX_STATUS_IDS_FILTRO_CASOS } from "@/components/casos/filtros/constants";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LISTAGEM_CARD_STACK_GAP } from "@/components/layout/listagem-page-layout";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { getUser } from "@/lib/auth";
import { importanceOptions } from "@/mocks/teste";
import type { ReportsFiltersForm, ReportsFiltrosAplicados } from "./types";
import { DEFAULT_REPORTS_STATUS_IDS, EMPTY_REPORTS_FILTERS } from "./types";

interface ReportsFiltrosProps {
  onAplicar: (filtros: ReportsFiltrosAplicados) => void;
}

export function ReportsFiltros({ onAplicar }: ReportsFiltrosProps) {
  const methods = useForm<ReportsFiltersForm>({
    defaultValues: {
      setor: "",
      produto: "",
      status_ids: [...DEFAULT_REPORTS_STATUS_IDS],
    },
  });

  const { data: setores } = useSetores();
  const produto = methods.watch("produto");
  const defaultSetorAplicadoRef = useRef(false);

  // Pré-seleciona o setor do usuário logado e aplica o filtro na carga inicial.
  useEffect(() => {
    if (defaultSetorAplicadoRef.current) return;
    if (!setores?.length) return;

    const setorUsuario = String(getUser()?.setor ?? "").trim();
    if (!setorUsuario) {
      defaultSetorAplicadoRef.current = true;
      return;
    }

    const setorMatch = setores.find(
      (s) => s.nome?.trim().toUpperCase() === setorUsuario.toUpperCase(),
    );
    if (!setorMatch) {
      defaultSetorAplicadoRef.current = true;
      return;
    }

    defaultSetorAplicadoRef.current = true;
    methods.setValue("setor", String(setorMatch.id));
    onAplicar({
      setor: setorMatch.nome.trim(),
      produto: "",
      status_ids: [...DEFAULT_REPORTS_STATUS_IDS],
    });
  }, [setores, methods, onAplicar]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
    }),
    [methods, produto],
  );

  const resolveSetorNome = useCallback(
    (setorId: string): string => {
      const id = setorId.trim();
      if (!id) return "";
      const setor = (setores ?? []).find((s) => String(s.id) === id);
      return setor?.nome?.trim() ?? "";
    },
    [setores],
  );

  const handleFiltrar = useCallback(() => {
    const values = methods.getValues();
    onAplicar({
      setor: resolveSetorNome(String(values.setor ?? "")),
      produto: String(values.produto ?? "").trim(),
      status_ids: (values.status_ids ?? []).slice(
        0,
        MAX_STATUS_IDS_FILTRO_CASOS,
      ),
    });
  }, [methods, onAplicar, resolveSetorNome]);

  const handleLimpar = useCallback(() => {
    methods.reset({
      setor: "",
      produto: "",
      status_ids: [...DEFAULT_REPORTS_STATUS_IDS],
    });
    onAplicar(EMPTY_REPORTS_FILTERS);
  }, [methods, onAplicar]);

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
              <div className="min-w-0">
                <CasoFormSetor />
              </div>
              <div className="min-w-0">
                <CasoFormProduto required={false} />
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

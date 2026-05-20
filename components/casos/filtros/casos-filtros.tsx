"use client";

import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormUsuarioAbertura } from "@/components/fields/caso-form-usuario-abertura";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { importanceOptions } from "@/mocks/teste";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { CasosFiltrosSheet } from "@/components/casos/filtros/casos-filtros-sheet";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import type { CasosFiltersForm } from "@/components/casos/filtros/casos-filtros.types";
import { EMPTY_CASOS_FILTERS_FORM } from "@/components/casos/filtros/casos-filtros.types";
import {
  dateToYmd,
  filtrosQueryKey,
  filtrosToFormDefaults,
  formToFiltrosAplicados,
  hasFiltersApplied,
} from "@/components/casos/filtros/casos-filtros-mappers";

interface CasosFiltrosProps {
  filtrosAplicados: CasosFiltrosAplicados;
  onAplicar: (filtros: CasosFiltrosAplicados) => void;
  onLimparSheet: () => void;
}

/** Campos exibidos apenas no sheet "Mais filtros". */
function countFiltrosSheetAtivos(p: {
  projeto_id: string;
  devAtribuido: string;
  qaAtribuido: string;
  tipo_abertura: "" | "CASO" | "REPORT";
  data_producao_inicio: Date | undefined;
  data_producao_fim: Date | undefined;
}): number {
  let n = 0;
  if (p.projeto_id?.trim()) n += 1;
  if (p.devAtribuido?.trim()) n += 1;
  if (p.qaAtribuido?.trim()) n += 1;
  if (p.tipo_abertura === "CASO" || p.tipo_abertura === "REPORT") {
    n += 1;
  }
  if (dateToYmd(p.data_producao_inicio)) n += 1;
  if (dateToYmd(p.data_producao_fim)) n += 1;
  return n;
}

export function CasosFiltros({
  filtrosAplicados,
  onAplicar,
  onLimparSheet,
}: CasosFiltrosProps) {
  const { data: categorias } = useCategorias();
  const [sheetOpen, setSheetOpen] = useState(false);

  const appliedQueryKey = filtrosQueryKey(filtrosAplicados);

  const categoriasSyncKey = useMemo(
    () => (categorias ?? []).map((c) => c.id).join(","),
    [categorias],
  );

  const methods = useForm<CasosFiltersForm>({
    defaultValues: EMPTY_CASOS_FILTERS_FORM,
  });

  const lastFormSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncKey = `${appliedQueryKey}|${categoriasSyncKey}`;
    if (lastFormSyncKeyRef.current === syncKey) return;
    lastFormSyncKeyRef.current = syncKey;
    methods.reset(filtrosToFormDefaults(filtrosAplicados, categorias ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey agrega deps; `methods` é estável
  }, [appliedQueryKey, categoriasSyncKey, filtrosAplicados, categorias]);

  const produto = methods.watch("produto");

  const [
    projetoIdWatch,
    devAtribuidoWatch,
    qaAtribuidoWatch,
    tipoAberturaWatch,
    dataProdInicioWatch,
    dataProdFimWatch,
  ] = methods.watch([
    "projeto_id",
    "devAtribuido",
    "qaAtribuido",
    "tipo_abertura",
    "data_producao_inicio",
    "data_producao_fim",
  ]);

  const totalFiltrosSheet = useMemo(
    () =>
      countFiltrosSheetAtivos({
        projeto_id: projetoIdWatch ?? "",
        devAtribuido: devAtribuidoWatch ?? "",
        qaAtribuido: qaAtribuidoWatch ?? "",
        tipo_abertura:
          tipoAberturaWatch === "CASO" || tipoAberturaWatch === "REPORT"
            ? tipoAberturaWatch
            : "",
        data_producao_inicio: dataProdInicioWatch,
        data_producao_fim: dataProdFimWatch,
      }),
    [
      projetoIdWatch,
      devAtribuidoWatch,
      qaAtribuidoWatch,
      tipoAberturaWatch,
      dataProdInicioWatch,
      dataProdFimWatch,
    ],
  );

  const handleFiltrar = useCallback(() => {
    onAplicar(formToFiltrosAplicados(methods.getValues(), categorias ?? []));
  }, [methods, onAplicar, categorias]);

  const formValues = methods.watch();
  const canFiltrar = useMemo(
    () =>
      hasFiltersApplied(
        formToFiltrosAplicados(formValues, categorias ?? []),
      ),
    [formValues, categorias],
  );

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
    }),
    [methods, produto],
  );

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className="bg-card  shadow-card rounded-lg shrink-0 mb-6">
          <CardHeader className="flex flex-row justify-between px-5 py-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Filtros
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <CasosFiltrosSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                trigger={
                  <Button size="sm" variant="outline" type="button">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-text-primary" />
                    {totalFiltrosSheet > 0
                      ? `Mais filtros (${totalFiltrosSheet})`
                      : "Mais filtros"}
                  </Button>
                }
                methods={methods}
                onFiltrar={handleFiltrar}
                onLimpar={onLimparSheet}
                filtrarDisabled={!canFiltrar}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <CasoFormProduto required={false} />
              <CasoFormVersao required={false} todas />
              <CasoFormModulo required={false} />
              <CasoFormCategoria required={false} />
              <CasoFormUsuarioAbertura required={false} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <Label className="text-sm font-medium text-text-label">
                  Descrição / Resumo
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou resumo..."
                    className="pl-9 h-[42px] rounded-lg border-border-input"
                    {...methods.register("descricao_resumo")}
                  />
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
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

              <div className="flex gap-2 col-span-1">
                <Button
                  type="button"
                  onClick={handleFiltrar}
                  disabled={!canFiltrar}
                  className="w-full px-4 flex-1 sm:flex-initial"
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

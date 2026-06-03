"use client";

import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { LISTAGEM_CARD_STACK_GAP } from "@/components/layout/listagem-page-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { importanceOptions } from "@/mocks/teste";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import { ChevronUp, Filter, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import type { CasosFiltersForm } from "@/components/casos/filtros/casos-filtros.types";
import { EMPTY_CASOS_FILTERS_FORM } from "@/components/casos/filtros/casos-filtros.types";
import {
  filtrosQueryKey,
  filtrosToFormDefaults,
  formToFiltrosAplicados,
  hasFiltersApplied,
} from "@/components/casos/filtros/casos-filtros-mappers";
import {
  CasosFiltrosAnimatedContent,
  type CasosFiltrosAnimationMode,
} from "@/components/casos/filtros/casos-filtros-animated-content";
import { CasosFiltrosCamposExpandidos } from "@/components/casos/filtros/casos-filtros-campos-expandidos";
import { CasosFiltrosAplicadosBadges } from "@/components/casos/filtros/casos-filtros-aplicados-badges";

interface CasosFiltrosProps {
  filtrosAplicados: CasosFiltrosAplicados;
  onAplicar: (filtros: CasosFiltrosAplicados) => void;
  onLimparSheet: () => void;
}

export function CasosFiltros({
  filtrosAplicados,
  onAplicar,
  onLimparSheet,
}: CasosFiltrosProps) {
  const { data: categorias } = useCategorias();
  const filtrosAtivos = hasFiltersApplied(filtrosAplicados);

  const [camposExpandidos, setCamposExpandidos] = useState(false);
  const [modoResumo, setModoResumo] = useState(filtrosAtivos);

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

  useEffect(() => {
    if (!filtrosAtivos) {
      setModoResumo(false);
      setCamposExpandidos(false);
    }
  }, [filtrosAtivos]);

  const produto = methods.watch("produto");

  const handleFiltrar = useCallback(() => {
    const next = formToFiltrosAplicados(methods.getValues(), categorias ?? []);
    onAplicar(next);
    setCamposExpandidos(false);
    if (hasFiltersApplied(next)) {
      setModoResumo(true);
    }
  }, [methods, onAplicar, categorias]);

  const handleAplicarFromBadges = useCallback(
    (filtros: CasosFiltrosAplicados) => {
      onAplicar(filtros);
      if (!hasFiltersApplied(filtros)) {
        setModoResumo(false);
        setCamposExpandidos(false);
      }
    },
    [onAplicar],
  );

  const formValues = methods.watch();
  const canFiltrar = useMemo(
    () =>
      hasFiltersApplied(formToFiltrosAplicados(formValues, categorias ?? [])),
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

  const animationMode: CasosFiltrosAnimationMode = modoResumo
    ? "resumo"
    : camposExpandidos
      ? "expandido"
      : "reduzido";

  const handleToggleExpandido = useCallback(() => {
    if (camposExpandidos) {
      setCamposExpandidos(false);
      if (filtrosAtivos) {
        setModoResumo(true);
      }
    } else {
      setModoResumo(false);
      setCamposExpandidos(true);
    }
  }, [camposExpandidos, filtrosAtivos]);

  const handleEditarFiltros = useCallback(() => {
    setModoResumo(false);
    setCamposExpandidos(true);
  }, []);

  return (
    <CasoFormProvider value={providerValue}>
      <FormProvider {...methods}>
        <Card className={`bg-card shadow-card rounded-lg shrink-0 ${LISTAGEM_CARD_STACK_GAP} overflow-hidden`}>
          <AnimatePresence mode="wait" initial={false}>
            {modoResumo ? (
              <CasosFiltrosAnimatedContent
                key="resumo"
                mode="resumo"
                className="flex w-full flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex shrink-0 items-center gap-1">
                    <Filter className="h-4 w-4 text-text-primary" />
                    <CardTitle className="text-sm font-semibold text-text-primary">
                      Filtros
                    </CardTitle>
                  </div>
                  <CasosFiltrosAplicadosBadges
                    filtrosAplicados={filtrosAplicados}
                    onAplicar={handleAplicarFromBadges}
                    className="min-w-0 flex-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 shrink-0 self-end sm:self-center"
                  onClick={handleEditarFiltros}
                >
                  <Search className="h-4 w-4 text-text-primary" />
                  <span>Mostrar Filtros</span>
                </Button>
              </CasosFiltrosAnimatedContent>
            ) : (
              <div key="edicao">
                <CardHeader className="flex flex-row justify-between px-5 py-2 border-b border-border-divider">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-text-primary" />
                    <CardTitle className="text-sm font-semibold text-text-primary">
                      Filtros
                    </CardTitle>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={handleToggleExpandido}
                  >
                    <ChevronUp
                      className={cn(
                        "h-3.5 w-3.5 text-text-primary transition-transform duration-200",
                        !camposExpandidos && "rotate-180",
                      )}
                    />
                    {/* <SlidersHorizontal className="h-3.5 w-3.5 text-text-primary" /> */}
                    <span>
                      {camposExpandidos ? "Colapsar Filtros" : "Mais Filtros"}
                    </span>
                  </Button>
                </CardHeader>

                <CardContent className="overflow-hidden p-6 pt-3">
                  <AnimatePresence mode="wait" initial={false}>
                    <CasosFiltrosAnimatedContent
                      key={animationMode}
                      mode={animationMode}
                      className="overflow-hidden"
                    >
                      {camposExpandidos ? (
                        <CasosFiltrosCamposExpandidos
                          onFiltrar={handleFiltrar}
                          onLimparExpandidos={onLimparSheet}
                          filtrarDisabled={!canFiltrar}
                        />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[18px] mb-1 items-end">
                          <CasoFormProduto required={false} />
                          <CasoFormVersao required={false} todas />
                          <div className="min-w-0 col-span-2">
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
                            className="h-9 w-full"
                          >
                            <Search className="h-3.5 w-3.5 mr-2" />
                            <span>Filtrar</span>
                          </Button>
                        </div>
                      )}
                    </CasosFiltrosAnimatedContent>
                  </AnimatePresence>
                </CardContent>
              </div>
            )}
          </AnimatePresence>
        </Card>
      </FormProvider>
    </CasoFormProvider>
  );
}

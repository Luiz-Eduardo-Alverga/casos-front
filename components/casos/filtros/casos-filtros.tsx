"use client";

import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { CircleDot, ChevronUp, Filter, Search } from "lucide-react";
import { LISTAGEM_CARD_STACK_GAP } from "@/components/layout/listagem-page-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormUsuarioAbertura } from "@/components/fields/caso-form-usuario-abertura";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { StatusMultiSelect } from "@/components/fields/status-multi-select";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { importanceOptions } from "@/mocks/teste";
import { useCategorias } from "@/hooks/catalogos/use-categorias";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import {
  getVersoesQueryKey,
  isSequenciaNoCatalogo,
  resolveVersaoProdutoForApi,
} from "@/components/casos/shared/versao-combobox";
import type { Versao } from "@/services/auxiliar/versoes";
import { cn } from "@/lib/utils";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import type { CasosFiltersForm } from "@/components/casos/filtros/casos-filtros.types";
import {
  EMPTY_CASOS_FILTERS_FORM,
  DEFAULT_FILTROS_RESUMO,
} from "@/components/casos/filtros/casos-filtros.types";
import type { CasoFiltroField } from "@/components/casos/filtros/casos-filtros.types";
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
import { CasosFiltrosPersonalizar } from "@/components/casos/filtros/casos-filtros-personalizar";
import { useUserFiltrosPreferencias } from "@/hooks/configuracoes/use-user-filtros-preferencias";

interface CasosFiltrosProps {
  filtrosAplicados: CasosFiltrosAplicados;
  onAplicar: (filtros: CasosFiltrosAplicados) => void;
  onLimparSheet: () => void;
}

/** Componentes internos dos campos que precisam de Controller devem ser definidos
 *  como funções separadas para que possam ser chamados dentro do mapa. */
function StatusField() {
  const { control } = useFormContext<CasosFiltersForm>();
  return (
    <Controller
      name="status_ids"
      control={control}
      render={({ field }) => (
        <StatusMultiSelect value={field.value ?? []} onChange={field.onChange} />
      )}
    />
  );
}

function TipoAberturaField() {
  const tipoAberturaOptions = useMemo(
    () => [
      { value: "CASO", label: "CASO" },
      { value: "REPORT", label: "REPORT" },
    ],
    [],
  );
  return (
    <ComboboxField
      name="tipo_abertura"
      label="Tipo de abertura"
      icon={CircleDot}
      options={tipoAberturaOptions}
      placeholder="Todos"
      emptyText="Nenhuma opção encontrada."
    />
  );
}

function DescricaoResumoField() {
  const { register } = useFormContext<CasosFiltersForm>();
  return (
    <div className="space-y-2 min-w-0">
      <Label className="text-sm font-medium text-text-label">
        Descrição / Resumo
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por descrição ou resumo..."
          className="pl-9 h-9 rounded-lg border-border-input"
          {...register("descricao_resumo")}
        />
      </div>
    </div>
  );
}

function DataProducaoInicioField() {
  const { control } = useFormContext<CasosFiltersForm>();
  return (
    <Controller
      name="data_producao_inicio"
      control={control}
      render={({ field }) => (
        <DatePickerInput
          label="Produção (início)"
          value={field.value}
          onChange={field.onChange}
          placeholder="Selecionar data"
          controlHeightClassName="h-9"
        />
      )}
    />
  );
}

function DataProducaoFimField() {
  const { control } = useFormContext<CasosFiltersForm>();
  return (
    <Controller
      name="data_producao_fim"
      control={control}
      render={({ field }) => (
        <DatePickerInput
          label="Produção (fim)"
          value={field.value}
          onChange={field.onChange}
          placeholder="Selecionar data"
          controlHeightClassName="h-9"
        />
      )}
    />
  );
}

/** Mapa de campo → componente JSX para a visão reduzida. */
const FILTRO_CAMPO_RENDER: Record<CasoFiltroField, () => ReactNode> = {
  produto: () => <CasoFormProduto required={false} />,
  versao: () => <CasoFormVersao required={false} todas />,
  status_ids: () => <StatusField />,
  modulo: () => <CasoFormModulo required={false} />,
  categoria: () => <CasoFormCategoria required={false} />,
  projeto_id: () => (
    <CasoFormProjeto requireProduto={false} name="projeto_id" required={false} autoSelectProjeto="never" />
  ),
  tipo_abertura: () => <TipoAberturaField />,
  descricao_resumo: () => <DescricaoResumoField />,
  usuario_abertura_id: () => <CasoFormUsuarioAbertura required={false} />,
  devAtribuido: () => (
    <CasoFormDevAtribuido required={false} requireProduto={false} label="Desenvolvedor" />
  ),
  qaAtribuido: () => (
    <CasoFormQaAtribuido required={false} requireProduto={false} label="QA" />
  ),
  data_producao_inicio: () => <DataProducaoInicioField />,
  data_producao_fim: () => <DataProducaoFimField />,
};

export function CasosFiltros({
  filtrosAplicados,
  onAplicar,
  onLimparSheet,
}: CasosFiltrosProps) {
  const queryClient = useQueryClient();
  const { data: categorias } = useCategorias();
  const filtrosAtivos = hasFiltersApplied(filtrosAplicados);
  const produtoFiltro = filtrosAplicados.produto?.trim() ?? "";
  const versaoFiltro = filtrosAplicados.versao?.trim() ?? "";
  const { data: versoesCatalogo = [] } = useVersoes({
    produto_id: produtoFiltro,
    enabled: Boolean(produtoFiltro) && Boolean(versaoFiltro),
    todas: true,
  });

  const { data: filtrosResumo = DEFAULT_FILTROS_RESUMO } =
    useUserFiltrosPreferencias();

  const [camposExpandidos, setCamposExpandidos] = useState(false);
  const [modoResumo, setModoResumo] = useState(filtrosAtivos);

  const appliedQueryKey = filtrosQueryKey(filtrosAplicados);

  const categoriasSyncKey = useMemo(
    () => (categorias ?? []).map((c) => c.id).join(","),
    [categorias],
  );

  const versoesSyncKey = useMemo(
    () => versoesCatalogo.map((v) => String(v.sequencia ?? "")).join(","),
    [versoesCatalogo],
  );

  const methods = useForm<CasosFiltersForm>({
    defaultValues: EMPTY_CASOS_FILTERS_FORM,
  });

  const lastFormSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const syncKey = `${appliedQueryKey}|${categoriasSyncKey}|${versoesSyncKey}`;
    if (lastFormSyncKeyRef.current === syncKey) return;
    lastFormSyncKeyRef.current = syncKey;
    methods.reset(
      filtrosToFormDefaults(filtrosAplicados, categorias ?? [], versoesCatalogo),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncKey agrega deps; `methods` é estável
  }, [
    appliedQueryKey,
    categoriasSyncKey,
    versoesSyncKey,
    filtrosAplicados,
    categorias,
    versoesCatalogo,
  ]);

  // URLs recentes podem ter sequencia; normaliza para texto (comportamento anterior).
  useEffect(() => {
    if (!produtoFiltro || !versaoFiltro || !versoesCatalogo.length) return;
    if (!isSequenciaNoCatalogo(versaoFiltro, versoesCatalogo)) return;

    const texto = resolveVersaoProdutoForApi(versaoFiltro, versoesCatalogo);
    if (!texto || texto === versaoFiltro) return;

    onAplicar({ ...filtrosAplicados, versao: texto });
  }, [
    produtoFiltro,
    versaoFiltro,
    versoesCatalogo,
    filtrosAplicados,
    onAplicar,
  ]);

  useEffect(() => {
    if (!filtrosAtivos) {
      setModoResumo(false);
      setCamposExpandidos(false);
    }
  }, [filtrosAtivos]);

  const produto = methods.watch("produto");

  const resolveVersoesParaAplicar = useCallback((): Versao[] | undefined => {
    const produtoId = String(methods.getValues("produto") ?? "").trim();
    if (!produtoId) return undefined;
    if (versoesCatalogo.length && produtoId === produtoFiltro) {
      return versoesCatalogo;
    }
    return queryClient.getQueryData<Versao[]>(
      getVersoesQueryKey(produtoId, "", true),
    );
  }, [methods, versoesCatalogo, produtoFiltro, queryClient]);

  const handleFiltrar = useCallback(() => {
    const next = formToFiltrosAplicados(
      methods.getValues(),
      categorias ?? [],
      resolveVersoesParaAplicar(),
    );
    onAplicar(next);
    setCamposExpandidos(false);
    if (hasFiltersApplied(next)) {
      setModoResumo(true);
    }
  }, [methods, onAplicar, categorias, resolveVersoesParaAplicar]);

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

                  <div className="flex items-center gap-1">
                    {!camposExpandidos && (
                      <CasosFiltrosPersonalizar filtrosAtuais={filtrosResumo} />
                    )}
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
                      <span>
                        {camposExpandidos ? "Colapsar Filtros" : "Mais Filtros"}
                      </span>
                    </Button>
                  </div>
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
                          {filtrosResumo.map((item) => (
                            <div
                              key={item.field}
                              className={cn(
                                "min-w-0",
                                item.colSpan === 2 && "col-span-2",
                              )}
                            >
                              {FILTRO_CAMPO_RENDER[item.field]?.()}
                            </div>
                          ))}
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

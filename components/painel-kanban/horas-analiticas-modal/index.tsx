"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Clock3, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { importanceOptions } from "@/mocks/teste";
import {
  useProducaoHorasAnaliticas,
  type ProducaoHorasAnaliticasParams,
} from "@/hooks/use-producao-horas-analiticas";
import type { HorasAnaliticasModalProps } from "./types";
import { getTodayYmd, parseHorasAnaliticasData } from "./utils";
import { HorasAnaliticasSummaryCards } from "./horas-analiticas-summary-cards";
import { HorasAnaliticasCasesList } from "./horas-analiticas-cases-list";
import { HorasAnaliticasCommitBox } from "./horas-analiticas-commit-box";
import { HorasAnaliticasEmptyState } from "./horas-analiticas-empty-state";
import { HorasAnaliticasContentSkeleton } from "./horas-analiticas-content-skeleton";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormRelator } from "@/components/fields";

interface HorasAnaliticasFiltersForm {
  produto: string;
  versao: string;
  projeto: string;
  devAtribuido: string;
  devAtribuidoLabel: string;
}

function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dateToYmdString(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function HorasAnaliticasModal({
  open,
  onOpenChange,
  produtoId,
  projetoId,
  usuarioId,
}: HorasAnaliticasModalProps) {
  const methods = useForm<HorasAnaliticasFiltersForm>({
    defaultValues: {
      versao: "",
      projeto: projetoId,
      devAtribuido: usuarioId,
      devAtribuidoLabel: "",
    },
  });

  const [dataProducao, setDataProducao] = useState<Date | undefined>(
    getTodayDate(),
  );
  const dataProducaoYmd = useMemo(
    () => dateToYmdString(dataProducao) ?? getTodayYmd(),
    [dataProducao],
  );

  const produtoSelecionado = methods.watch("produto")?.trim() ?? "";
  const projetoSelecionado = methods.watch("projeto")?.trim() ?? "";
  const colaboradorSelecionado = methods.watch("devAtribuido")?.trim() ?? "";
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<ProducaoHorasAnaliticasParams | null>(null);
  const [commitDescription, setCommitDescription] = useState("");

  // useEffect(() => {
  //   methods.setValue("produto", produtoId || "");
  // }, [methods, produtoId]);

  useEffect(() => {
    methods.setValue("projeto", projetoId || "");
  }, [methods, projetoId]);

  useEffect(() => {
    methods.setValue("devAtribuido", usuarioId || "");
  }, [methods, usuarioId]);

  const canFetch =
    Boolean(open) &&
    Boolean(
      produtoSelecionado || projetoSelecionado || colaboradorSelecionado,
    ) &&
    Boolean(dataProducaoYmd.trim());

  const query = useProducaoHorasAnaliticas(filtrosAplicados ?? undefined, {
    enabled: false,
  });
  const { refetch } = query;

  useEffect(() => {
    if (!filtrosAplicados) return;
    void refetch();
  }, [filtrosAplicados, refetch]);

  const handleAtualizar = () => {
    if (!canFetch) return;

    setFiltrosAplicados({
      produto_id: produtoSelecionado || undefined,
      projeto_id: projetoSelecionado || undefined,
      usuario: colaboradorSelecionado || undefined,
      data_producao_inicio: dataProducaoYmd,
      data_producao_fim: dataProducaoYmd,
    });
  };

  const parsedData = useMemo(
    () => parseHorasAnaliticasData(query.data?.data ?? []),
    [query.data?.data],
  );

  const handleGenerateCommitDescription = () => {
    const generatedDescription = parsedData.casos
      .map((caso) => `#${caso.registro} - ${caso.descricaoResumo};`)
      .join("\n");

    setCommitDescription(generatedDescription);
  };

  const isLoadingResults = query.isLoading || query.isFetching;
  const semBuscaAplicada = !filtrosAplicados;
  const semResultados =
    Boolean(filtrosAplicados) &&
    !isLoadingResults &&
    parsedData.casos.length === 0;
  const mostrarConteudo = !semBuscaAplicada && !semResultados;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[calc(100vw-1rem)] max-w-[900px] flex-col gap-0 overflow-hidden border-border-divider bg-white p-0 shadow-2xl sm:w-[min(96vw,900px)]">
        <DialogHeader className="border-b border-border-divider px-5 pb-5 pt-5 text-left sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 shadow-sm">
              <Clock3 className="h-4 w-4 text-white" aria-hidden />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold leading-tight text-text-primary">
                Horas Analíticas
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary">
                Visualização e controle de horas trabalhadas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <CasoFormProvider
            value={{
              form: methods,
              importanceOptions,
              produto: produtoSelecionado,
              isDisabled: false,
              lazyLoadComboboxOptions: false,
            }}
          >
            <FormProvider {...methods}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <div className="space-y-1.5 md:col-span-1">
                  <DatePickerInput
                    id="horas-analiticas-data"
                    value={dataProducao}
                    onChange={setDataProducao}
                    placeholder="Selecione a data"
                  />
                </div>

                <div className="md:col-span-1">
                  <CasoFormProduto required={false} />
                </div>

                <div className="md:col-span-1">
                  <CasoFormDevAtribuido
                    name="devAtribuido"
                    labelName="devAtribuidoLabel"
                    label="Colaborador"
                    required={false}
                    requireProduto={false}
                  />
                  {/* <CasoFormRelator
                    name="relator"
                    label="Relator"
                    required={false}
                  /> */}
                </div>

                <div className="md:col-span-1">
                  <CasoFormProjeto required={false} requireProduto={false} />
                </div>

                <div className="flex items-end md:col-span-1">
                  <Button
                    type="button"
                    onClick={handleAtualizar}
                    className="w-full bg-slate-800 text-white hover:bg-slate-700 h-9"
                    aria-label="Atualizar horas analíticas"
                    disabled={!canFetch || query.isFetching}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
                    Atualizar
                  </Button>
                </div>
              </div>
            </FormProvider>
          </CasoFormProvider>

          {semBuscaAplicada ? (
            <HorasAnaliticasEmptyState
              variant="sem_filtros"
              onApplyFilters={handleAtualizar}
              isApplyFiltersDisabled={!canFetch || query.isFetching}
            />
          ) : semResultados ? (
            <HorasAnaliticasEmptyState
              variant="sem_resultados"
              onApplyFilters={handleAtualizar}
              isApplyFiltersDisabled={!canFetch || query.isFetching}
            />
          ) : null}

          {mostrarConteudo ? (
            isLoadingResults ? (
              <HorasAnaliticasContentSkeleton />
            ) : (
              <>
                <HorasAnaliticasSummaryCards resumo={parsedData.resumo} />

                <HorasAnaliticasCasesList casos={parsedData.casos} />

                <HorasAnaliticasCommitBox
                  value={commitDescription}
                  onChange={setCommitDescription}
                  onGenerate={handleGenerateCommitDescription}
                  isGenerateDisabled={parsedData.casos.length === 0}
                />
              </>
            )
          ) : null}

          {query.error ? (
            <p className="text-sm text-red-600" role="alert">
              {query.error instanceof Error
                ? query.error.message
                : "Não foi possível carregar as horas analíticas."}
            </p>
          ) : null}
        </div>

        {/* <footer className="flex items-center justify-end gap-3 border-t border-border-divider bg-white px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            aria-label="Cancelar e fechar modal"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="bg-slate-800 text-white hover:bg-slate-700"
            aria-label="Salvar horas"
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            Salvar Horas
          </Button>
        </footer> */}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

import { useUpdateCaso } from "@/hooks/use-update-caso";

import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { CasoEditHeader } from "./caso-edit-header";
import { CasoEditRodapeAcoes } from "./caso-edit-rodape-acoes";
import { CasoEditColunaDireita } from "./caso-edit-coluna-direita";
import { CasoEditCardClassificacao } from "./caso-edit-card-classificacao";
import { AbaInicial } from "./aba-inicial";
import { AbaAnotacoes } from "./anotacoes";
import { AbaRelacoes } from "./relacoes";
import { AbaClientes } from "./clientes";
import { AbaProducao } from "./producao";
import { CasoEditProvider } from "./caso-edit-context";
import { AbaAnexos } from "./anexos";
import { useCaseAttachments } from "@/hooks/use-case-attachments";
import { useCasoHistorico } from "@/hooks/use-caso-historico";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import {
  buildAnaliseConclusaoByStatus,
  mapCasoStatusToReportStatus,
  mapReportStatusToCasoStatus,
  normalizeAnaliseStatusForForm,
} from "./report-analise-modal/utils";
import { AbaHistorico } from "./historico/index";

const editFormSchema = z.object({
  produto: z.string().min(1, "Produto é obrigatório"),
  importancia: z.string().min(1, "Importância é obrigatória"),
  modulo: z.string(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  devAtribuido: z.string().min(1, "Dev atribuído é obrigatório"),
  versao: z.string().min(1, "Versão é obrigatória"),
  projeto: z.string().min(1, "Projeto é obrigatório"),
  origem: z.string().min(1, "Origem é obrigatória"),
  relator: z.string().min(1, "Relator é obrigatório"),
  qaAtribuido: z.string(),
  DescricaoResumo: z.string().min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z.string().min(1, "Descrição completa é obrigatória"),
  InformacoesAdicionais: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
  analiseStatus: z.string().optional(),
  reportPrioridade: z.string().optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

function getDefaultValues(item: ProjetoMemoriaItem): EditFormData {
  const { caso, produto, projeto } = item;
  const qaId = caso?.usuarios?.qa?.id;
  const qaAtribuido =
    qaId === 0 || qaId === "0" || qaId == null ? "" : String(qaId);
  return {
    produto: String(produto?.id ?? ""),
    importancia: String(caso?.caracteristicas?.prioridade ?? "3"),
    modulo: caso?.caracteristicas?.modulo ?? "",
    categoria: String(caso?.caracteristicas?.categoria ?? "4"),
    devAtribuido: String(caso?.usuarios?.desenvolvimento?.id ?? ""),
    versao: produto?.versao != null ? String(produto.versao) : "",
    projeto: String(projeto?.id ?? ""),
    origem: String(caso?.caracteristicas?.id_origem ?? "4"),
    relator: String(caso?.usuarios?.relator?.id ?? ""),
    qaAtribuido: qaAtribuido,
    DescricaoResumo: caso?.textos?.descricao_resumo ?? "",
    DescricaoCompleta: caso?.textos?.descricao_completa ?? "",
    InformacoesAdicionais: caso?.textos?.informacoes_adicionais ?? "",
    status: String(caso?.status?.status_id ?? "1"),
    analiseStatus: normalizeAnaliseStatusForForm(item.report?.analise_status),
    reportPrioridade: String(item.report?.prioridade ?? ""),
  };
}

const fallbackDefaults: EditFormData = {
  produto: "",
  importancia: "3",
  modulo: "",
  categoria: "4",
  devAtribuido: "",
  versao: "",
  projeto: "",
  origem: "4",
  relator: "",
  qaAtribuido: "",
  DescricaoResumo: "",
  DescricaoCompleta: "",
  InformacoesAdicionais: "",
  status: "1",
  analiseStatus: "",
  reportPrioridade: "",
};

export interface CasoEditFormProps {
  item: ProjetoMemoriaItem;
  casoId: string;
}

export function CasoEditForm({ item, casoId }: CasoEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState("inicial");

  const caso = item.caso;
  const numeroCaso = caso?.id ?? Number(casoId);
  const isReport = item.caso.caracteristicas.tipo_abertura === "REPORT";
  const rbacReady = permissionsLoaded();
  const showAnexosTab = !rbacReady || hasPermission("list-case-attachment");
  const anexosQuery = useCaseAttachments({
    casoRegistro: Number.isFinite(numeroCaso) ? numeroCaso : null,
    enabled: showAnexosTab && Number.isFinite(numeroCaso),
  });
  const countAnexos = anexosQuery.data?.length ?? 0;
  const historicoQuery = useCasoHistorico({
    registro: Number.isFinite(numeroCaso) ? numeroCaso : undefined,
    enabled: tabValue === "historico" && Number.isFinite(numeroCaso),
  });
  const countHistorico = historicoQuery.data?.total;

  const statusIdApi = (() => {
    const n = Number(caso?.status?.status_id);
    return Number.isFinite(n) ? n : 0;
  })();
  const defaultValues = useMemo(() => getDefaultValues(item), [item]);

  const methods = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: defaultValues ?? fallbackDefaults,
  });
  const statusValue = useWatch({ control: methods.control, name: "status" });
  const analiseStatusValue = useWatch({
    control: methods.control,
    name: "analiseStatus",
  });
  const previousStatusValueRef = useRef(String(defaultValues.status ?? ""));
  const previousAnaliseStatusValueRef = useRef(
    String(defaultValues.analiseStatus ?? ""),
  );

  const produtoWatch = methods.watch("produto");

  const updateCaso = useUpdateCaso(casoId);
  const isUpdateCasoMutatingForPage =
    useIsMutating({ mutationKey: ["update-caso", casoId] }) > 0;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria", casoId] });
  }, [queryClient, casoId]);

  useEffect(() => {
    const statusAtual = String(statusValue ?? "").trim();
    const analiseStatusAtual = String(analiseStatusValue ?? "").trim();

    if (!isReport) {
      previousStatusValueRef.current = statusAtual;
      previousAnaliseStatusValueRef.current = analiseStatusAtual;
      return;
    }

    const statusAlterado = statusAtual !== previousStatusValueRef.current;
    const analiseStatusAlterado =
      analiseStatusAtual !== previousAnaliseStatusValueRef.current;

    if (analiseStatusAlterado && !statusAlterado) {
      const statusCasoEquivalente =
        mapReportStatusToCasoStatus(analiseStatusAtual);
      if (
        statusCasoEquivalente !== undefined &&
        statusAtual !== String(statusCasoEquivalente)
      ) {
        methods.setValue("status", String(statusCasoEquivalente), {
          shouldDirty: true,
          shouldValidate: true,
        });
        previousStatusValueRef.current = String(statusCasoEquivalente);
        previousAnaliseStatusValueRef.current = analiseStatusAtual;
        return;
      }
    }

    if (statusAlterado && !analiseStatusAlterado) {
      const statusReportEquivalente = mapCasoStatusToReportStatus(statusAtual);
      if (
        statusReportEquivalente !== undefined &&
        analiseStatusAtual !== statusReportEquivalente
      ) {
        methods.setValue("analiseStatus", statusReportEquivalente, {
          shouldDirty: true,
          shouldValidate: true,
        });
        previousStatusValueRef.current = statusAtual;
        previousAnaliseStatusValueRef.current = statusReportEquivalente;
        return;
      }
    }

    previousStatusValueRef.current = statusAtual;
    previousAnaliseStatusValueRef.current = analiseStatusAtual;
  }, [analiseStatusValue, isReport, methods, statusValue]);

  const handleSalvar = methods.handleSubmit(async (formData: EditFormData) => {
    try {
      const versaoProduto =
        formData.versao?.split("-")[1]?.trim() || formData.versao || "";
      const statusReportAtual = normalizeAnaliseStatusForForm(
        item.report?.analise_status,
      );
      const statusReportSelecionado = (formData.analiseStatus ?? "").trim();
      let statusCasoFinal =
        Number(formData.status) || Number(caso?.status?.status_id ?? 1);
      let statusReportFinal = statusReportSelecionado;
      const statusReportSelecionadoAlterado =
        statusReportSelecionado !== "" &&
        statusReportSelecionado !== statusReportAtual;

      if (isReport) {
        const statusCasoPorReport = statusReportSelecionadoAlterado
          ? mapReportStatusToCasoStatus(statusReportSelecionado)
          : undefined;

        if (statusCasoPorReport !== undefined) {
          statusCasoFinal = statusCasoPorReport;
        } else if (!statusReportSelecionadoAlterado) {
          // Sincroniza report a partir do status do caso apenas quando o usuário
          // não escolheu um status de report novo sem mapeamento (ex.: 20, 22).
          const statusReportPorCaso =
            mapCasoStatusToReportStatus(statusCasoFinal);
          if (statusReportPorCaso !== undefined) {
            statusReportFinal = statusReportPorCaso;
          }
        }
      }

      const forceStatusEDevPorAnalise = statusReportFinal === "21";
      const statusReportAlterado =
        statusReportFinal !== "" && statusReportFinal !== statusReportAtual;
      const statusReportAprovado =
        statusReportFinal !== "21" && statusReportFinal !== "0";

      console.log("statusReportFinal", statusReportFinal);

      const analiseDataConclusao = statusReportAlterado
        ? buildAnaliseConclusaoByStatus(statusReportFinal)
        : undefined;

      const payload: UpdateCasoRequest = {
        DescricaoResumo: formData.DescricaoResumo,
        DescricaoCompleta: (formData.DescricaoCompleta || "").replace(
          /\r?\n/g,
          "\r\n",
        ),
        InformacoesAdicionais: formData.InformacoesAdicionais ?? undefined,
        Prioridade: Number(formData.importancia),
        Categoria: Number(formData.categoria),
        Relator: Number(formData.relator),
        AtribuidoPara: forceStatusEDevPorAnalise
          ? 631
          : Number(formData.devAtribuido),
        Modulo: formData.modulo || undefined,
        VersaoProduto: versaoProduto,
        Cronograma_id: Number(formData.projeto),
        Id_Origem: Number(formData.origem),
        status: forceStatusEDevPorAnalise ? 8 : statusCasoFinal,
        atribuido_qa: Number(formData.qaAtribuido),
        report_analise_aprovado: isReport ? statusReportAprovado : undefined,
        report_analise_status: statusReportAlterado
          ? statusReportFinal
          : undefined,
        report_analise_data_conclusao: analiseDataConclusao,
        report_data_limite: forceStatusEDevPorAnalise
          ? null
          : analiseDataConclusao,
      };
      await updateCaso.mutateAsync({ id: casoId, data: payload });
      toast.success("Caso atualizado com sucesso.");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar caso.");
    }
  });

  const canEditCase = !rbacReady || hasPermission("edit-case");

  const anotacoes = (caso?.anotacoes ??
    []) as ProjetoMemoriaItem["caso"]["anotacoes"];
  const clientes = (caso?.clientes ??
    []) as ProjetoMemoriaItem["caso"]["clientes"];
  const relacoes = (caso?.relacoes ??
    []) as ProjetoMemoriaItem["caso"]["relacoes"];
  const countAnotacoes = Array.isArray(anotacoes) ? anotacoes.length : 0;
  const countClientes = Array.isArray(clientes) ? clientes.length : 0;
  const countRelacoes = Array.isArray(relacoes) ? relacoes.length : 0;

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: produtoWatch,
      isDisabled:
        updateCaso.isPending || isUpdateCasoMutatingForPage || !canEditCase,
      lazyLoadComboboxOptions: true as const,
      editCaseItem: item,
    }),
    [
      methods,
      produtoWatch,
      updateCaso.isPending,
      isUpdateCasoMutatingForPage,
      canEditCase,
      item,
    ],
  );

  const casoEditValue = useMemo(
    () => ({
      memoriaQueryId: casoId,
      numeroCaso,
      canEditCase,
      invalidate,
      isSaving: updateCaso.isPending || isUpdateCasoMutatingForPage,
      statusIdApi,
      onSalvar: handleSalvar,
    }),
    [
      casoId,
      numeroCaso,
      canEditCase,
      invalidate,
      updateCaso.isPending,
      isUpdateCasoMutatingForPage,
      statusIdApi,
      handleSalvar,
    ],
  );

  return (
    <CasoEditProvider value={casoEditValue}>
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="flex flex-col flex-1 lg:min-h-0 lg:overflow-hidden"
      >
        <CasoEditHeader
          countAnotacoes={countAnotacoes}
          countRelacoes={countRelacoes}
          countClientes={countClientes}
          countAnexos={countAnexos}
          showAnexosTab={showAnexosTab}
        />

        <div className="mt-4 flex-1 flex flex-col min-h-0 overflow-auto">
          <CasoFormProvider value={providerValue}>
            <FormProvider {...methods}>
              <div className="flex-1 pb-12">
                <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
                  <div className="flex min-h-0 flex-1 min-w-0 flex-col gap-6">
                    <TabsContent
                      value="inicial"
                      className="flex-1 flex flex-col mt-0 min-h-0 data-[state=inactive]:hidden"
                    >
                      <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      >
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                          <AbaInicial />
                        </div>
                      </fieldset>
                    </TabsContent>

                    <TabsContent
                      value="anotacoes"
                      className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                    >
                      {/* <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      > */}
                      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
                        <AbaAnotacoes
                          report={item.caso.textos.descricao_completa ?? ""}
                          anotacoes={anotacoes ?? []}
                        />
                      </div>
                      {/* </fieldset> */}
                    </TabsContent>

                    {showAnexosTab && (
                      <TabsContent
                        value="anexos"
                        className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                      >
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                          <AbaAnexos casoRegistro={numeroCaso} />
                        </div>
                      </TabsContent>
                    )}

                    <TabsContent
                      value="clientes"
                      className="mt-0 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
                    >
                      {/* <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      > */}
                      <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <AbaClientes clientes={clientes ?? []} />
                        <CasoEditCardClassificacao />
                      </div>
                      {/* </fieldset> */}
                    </TabsContent>

                    <TabsContent
                      value="relacoes"
                      className="mt-0 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
                    >
                      <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      >
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                          <AbaRelacoes relacoes={relacoes ?? []} />
                          <CasoEditCardClassificacao />
                        </div>
                      </fieldset>
                    </TabsContent>

                    <TabsContent
                      value="producao"
                      className="mt-0 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
                    >
                      <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      >
                        <div className="flex-1 flex flex-col gap-6 min-w-0">
                          <AbaProducao item={item} />
                        </div>
                      </fieldset>
                    </TabsContent>

                    <TabsContent
                      value="historico"
                      className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                    >
                      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
                        <AbaHistorico
                          numeroCaso={numeroCaso}
                          isLoading={historicoQuery.isLoading}
                          isFetching={historicoQuery.isFetching}
                          error={historicoQuery.error}
                          historico={historicoQuery.data?.data ?? []}
                        />
                      </div>
                    </TabsContent>
                  </div>

                  <fieldset
                    disabled={!canEditCase}
                    className="contents"
                    aria-disabled={!canEditCase}
                  >
                    <CasoEditColunaDireita />
                  </fieldset>
                </div>
              </div>

              <CasoEditRodapeAcoes
                tempoStatus={
                  item?.caso?.tempos?.tempo_status ??
                  item?.caso?.status?.tempo_status
                }
                statusTempo={
                  item?.caso?.tempos?.status_tempo ??
                  item?.caso?.status?.status_tempo
                }
                onCancelar={() => router.back()}
                onRedirecionarParaAbaProducao={() => setTabValue("producao")}
                dataAbertura={item?.caso?.datas?.abertura ?? ""}
                usuarioAbertura={item?.caso?.usuarios?.abertura?.nome ?? ""}
              />
            </FormProvider>
          </CasoFormProvider>
        </div>
      </Tabs>
    </CasoEditProvider>
  );
}

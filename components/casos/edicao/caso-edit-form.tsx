"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { isCasoBloqueado } from "@/lib/casos/is-caso-bloqueado";
import { getCasoAberturaInfo } from "@/lib/casos/caso-abertura-info";

import { useUpdateCaso } from "@/hooks/casos/use-update-caso";

import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { CasoEditHeader } from "./caso-edit-header";
import { CasoEditColunaDireita } from "./caso-edit-coluna-direita";
import { CasoEditCardClassificacao } from "./caso-edit-card-classificacao";
import { AbaInicial } from "./aba-inicial";
import { AbaAnotacoes } from "./anotacoes";
import { AbaRelacoes } from "./relacoes";
import { AbaClientes } from "./clientes";
import { AbaProducao } from "./producao";
import { CasoEditProvider } from "./caso-edit-context";
import { AbaAnexos } from "./anexos";
import { useCaseAttachments } from "@/hooks/casos/use-case-attachments";
import { useCasoHistorico } from "@/hooks/casos/use-caso-historico";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { buildCasoUpdatePayload } from "@/components/casos/shared/payload";
import {
  getVersoesQueryKey,
  isSequenciaNoCatalogo,
  mergeEditVersaoIntoCatalog,
  resolveVersaoProdutoForApi,
  resolveVersaoSequenciaForForm,
} from "@/components/casos/shared/versao-combobox";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { useStatus } from "@/hooks/catalogos/use-status";
import type { Versao } from "@/services/auxiliar/versoes";
import {
  normalizeAnaliseStatusForForm,
  resolveReportStatusFromCaso,
} from "./report-analise-modal/utils";
import { buildCasoEditSnapshot } from "./save/edit-snapshot";
import { computeCasoEditSave } from "./save/compute-caso-edit-save";
import { computeCasoEditSync } from "./save/compute-caso-edit-sync";
import { AbaHistorico } from "./historico/index";
import { getUser } from "@/lib/auth";
import {
  applyDev631ToCasoEditForm,
  type Dev631SetValue,
} from "@/lib/report/apply-dev-631-form";

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
  Anexo: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
  analiseStatus: z.string().optional(),
  reportPrioridade: z.string().optional(),
  devAtribuidoLabel: z.string().optional(),
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
    Anexo: caso?.textos?.anexo ?? "",
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
  Anexo: "",
  status: "1",
  analiseStatus: "",
  reportPrioridade: "",
};

export interface CasoEditFormProps {
  item: ProjetoMemoriaItem;
  casoId: string;
}

function resolveInitialTabFromUrl(tab: string | null): string {
  return tab === "producao" ? "producao" : "inicial";
}

export function CasoEditForm({ item, casoId }: CasoEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const tabFromUrl = searchParams.get("tab");
  const [tabValue, setTabValue] = useState(() =>
    resolveInitialTabFromUrl(tabFromUrl),
  );
  const [novaAnotacaoDraft, setNovaAnotacaoDraft] = useState("");

  useEffect(() => {
    if (tabFromUrl !== "producao") return;
    router.replace(`/casos/${casoId}`, { scroll: false });
  }, [tabFromUrl, router, casoId]);

  const caso = item.caso;
  const numeroCaso = caso?.id ?? Number(casoId);
  const aberturaInfo = useMemo(() => getCasoAberturaInfo(caso), [caso]);
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
  const snapshotRef = useRef(buildCasoEditSnapshot(item));

  const methods = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: defaultValues ?? fallbackDefaults,
  });
  const previousStatusValueRef = useRef(String(defaultValues.status ?? ""));
  const previousAnaliseStatusValueRef = useRef(
    String(defaultValues.analiseStatus ?? ""),
  );
  const previousVersaoRef = useRef(String(defaultValues.versao ?? "").trim());

  const produtoWatch = methods.watch("produto");

  const editVersaoFallbackBase = useMemo(
    () => ({
      versaoProduto: item.produto?.versao,
      produtoId: String(item.produto?.id ?? ""),
    }),
    [item.produto?.id, item.produto?.versao],
  );

  const mergeEditVersaoCatalog = useCallback(
    (versoes: Versao[] | undefined, formVersaoValue?: string) =>
      mergeEditVersaoIntoCatalog(versoes ?? [], {
        ...editVersaoFallbackBase,
        formVersaoValue,
        formProdutoId: String(produtoWatch ?? ""),
      }),
    [editVersaoFallbackBase, produtoWatch],
  );

  const { data: versoesCatalogo } = useVersoes({
    produto_id: produtoWatch,
    enabled: Boolean(String(produtoWatch ?? "").trim()),
    todas: false,
  });

  const getVersoesForProduto = useCallback(
    (produtoId: string, formVersaoValue?: string): Versao[] | undefined => {
      const id = String(produtoId ?? "").trim();
      if (!id) return undefined;
      let base: Versao[] | undefined;
      if (versoesCatalogo?.length && String(produtoWatch) === id) {
        base = versoesCatalogo;
      } else {
        base = queryClient.getQueryData<Versao[]>(
          getVersoesQueryKey(id, "", false),
        );
      }
      return mergeEditVersaoIntoCatalog(base ?? [], {
        ...editVersaoFallbackBase,
        formVersaoValue,
        formProdutoId: id,
      });
    },
    [queryClient, versoesCatalogo, produtoWatch, editVersaoFallbackBase],
  );

  const getVersoesForProdutoRef = useRef(getVersoesForProduto);
  useEffect(() => {
    getVersoesForProdutoRef.current = getVersoesForProduto;
  }, [getVersoesForProduto]);

  useEffect(() => {
    const values = getDefaultValues(item);
    const versoes = getVersoesForProdutoRef.current(
      values.produto,
      values.versao,
    );
    values.versao = resolveVersaoSequenciaForForm(values.versao, versoes);

    snapshotRef.current = buildCasoEditSnapshot(item);
    methods.reset(values);
    previousStatusValueRef.current = String(values.status ?? "");
    previousAnaliseStatusValueRef.current = String(values.analiseStatus ?? "");
    previousVersaoRef.current =
      resolveVersaoProdutoForApi(values.versao, versoes) ||
      String(values.versao ?? "").trim();
  }, [item, methods]);

  // Catálogo pode chegar após o reset: alinha texto → sequencia sem novo reset completo.
  useEffect(() => {
    const atual = String(methods.getValues("versao") ?? "").trim();
    const versoesMerged = mergeEditVersaoCatalog(versoesCatalogo, atual);
    if (!versoesMerged.length || !atual) return;
    if (isSequenciaNoCatalogo(atual, versoesMerged)) return;

    const sequencia = resolveVersaoSequenciaForForm(atual, versoesMerged);
    if (!sequencia || sequencia === atual) return;

    methods.setValue("versao", sequencia, { shouldDirty: false });
    previousVersaoRef.current = resolveVersaoProdutoForApi(
      sequencia,
      versoesMerged,
    );
  }, [versoesCatalogo, methods, mergeEditVersaoCatalog]);

  const statusValue = useWatch({ control: methods.control, name: "status" });
  const analiseStatusValue = useWatch({
    control: methods.control,
    name: "analiseStatus",
  });
  const versaoValue = useWatch({ control: methods.control, name: "versao" });

  const resolveVersoesParaPayload = useCallback((): Versao[] | undefined => {
    const produtoId = String(produtoWatch ?? "").trim();
    const formVersao = String(methods.getValues("versao") ?? "").trim();
    let base: Versao[] | undefined;
    if (versoesCatalogo?.length && String(produtoWatch) === produtoId) {
      base = versoesCatalogo;
    } else if (produtoId) {
      base = queryClient.getQueryData<Versao[]>(
        getVersoesQueryKey(produtoId, "", false),
      );
    }
    return mergeEditVersaoCatalog(base, formVersao);
  }, [
    versoesCatalogo,
    produtoWatch,
    queryClient,
    methods,
    mergeEditVersaoCatalog,
  ]);

  const updateCaso = useUpdateCaso(casoId);
  const isUpdateCasoMutatingForPage =
    useIsMutating({ mutationKey: ["update-caso", casoId] }) > 0;

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria", casoId] });
  }, [queryClient, casoId]);

  const getReportStatusFromCasoStatus = useCallback(
    (status: number) => resolveReportStatusFromCaso(status),
    [],
  );

  useEffect(() => {
    const statusAtual = String(statusValue ?? "").trim();
    const analiseStatusAtual = String(analiseStatusValue ?? "").trim();
    const versaoSequencia = String(versaoValue ?? "").trim();
    const versoes = resolveVersoesParaPayload();
    const versaoLabel = resolveVersaoProdutoForApi(versaoSequencia, versoes);

    const result = computeCasoEditSync({
      statusCaso: statusAtual,
      analiseStatus: analiseStatusAtual,
      versao: versaoLabel,
      previousStatusCaso: previousStatusValueRef.current,
      previousAnaliseStatus: previousAnaliseStatusValueRef.current,
      previousVersao: previousVersaoRef.current,
      isReport,
    });

    if (result.nextStatusCaso !== undefined) {
      methods.setValue("status", result.nextStatusCaso, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
    if (result.nextAnaliseStatus !== undefined) {
      methods.setValue("analiseStatus", result.nextAnaliseStatus, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
    if (result.nextDev631) {
      applyDev631ToCasoEditForm(methods.setValue as Dev631SetValue);
    }

    previousStatusValueRef.current = result.nextPrevStatusCaso;
    previousAnaliseStatusValueRef.current = result.nextPrevAnaliseStatus;
    previousVersaoRef.current = result.nextPrevVersao;
  }, [
    analiseStatusValue,
    isReport,
    methods,
    statusValue,
    versaoValue,
    resolveVersoesParaPayload,
  ]);

  const handleSalvar = methods.handleSubmit(async (formData: EditFormData) => {
    try {
      const userId = getUser()?.id;
      const { dirtyFields } = methods.formState;

      const versoes = resolveVersoesParaPayload();
      const versaoLabel = resolveVersaoProdutoForApi(formData.versao, versoes);

      const saveResult = computeCasoEditSave({
        isReport,
        snapshot: snapshotRef.current,
        formData: {
          status: formData.status,
          analiseStatus: formData.analiseStatus,
          versao: versaoLabel,
          devAtribuido: formData.devAtribuido,
        },
        dirtyFields: {
          status: dirtyFields.status,
          analiseStatus: dirtyFields.analiseStatus,
          versao: dirtyFields.versao,
        },
        defaultCasoStatusId: Number(caso?.status?.status_id ?? 1),
        userId,
      });

      const payload = buildCasoUpdatePayload({
        data: {
          ...formData,
          devAtribuido: saveResult.devAtribuido,
        },
        isReport,
        statusCasoFinal: saveResult.statusCasoFinal,
        reportFields: saveResult.reportFields,
        versoes,
      });

      await updateCaso.mutateAsync({ id: casoId, data: payload });
      toast.success("Caso atualizado com sucesso.");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar caso.");
    }
  });

  const canEditCase =
    (!rbacReady || hasPermission("edit-case")) && !isCasoBloqueado(caso?.flags);

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
      aberturaInfo,
      canEditCase,
      invalidate,
      isSaving: updateCaso.isPending || isUpdateCasoMutatingForPage,
      statusIdApi,
      onSalvar: handleSalvar,
      getReportStatusFromCasoStatus: isReport
        ? getReportStatusFromCasoStatus
        : undefined,
      novaAnotacaoDraft,
      setNovaAnotacaoDraft,
    }),
    [
      casoId,
      numeroCaso,
      aberturaInfo,
      canEditCase,
      invalidate,
      updateCaso.isPending,
      isUpdateCasoMutatingForPage,
      statusIdApi,
      handleSalvar,
      isReport,
      getReportStatusFromCasoStatus,
      novaAnotacaoDraft,
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
          tempoStatus={
            item?.caso?.tempos?.tempo_status ?? item?.caso?.status?.tempo_status
          }
          statusTempo={
            item?.caso?.tempos?.status_tempo ?? item?.caso?.status?.status_tempo
          }
          onRedirecionarParaAbaProducao={() => setTabValue("producao")}
        />

        <div className="mt-2 flex-1 flex flex-col min-h-0 overflow-auto">
          <CasoFormProvider value={providerValue}>
            <FormProvider {...methods}>
              <div className="flex-1">
                <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
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
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <AbaClientes
                          clientes={clientes ?? []}
                          isTabActive={tabValue === "clientes"}
                        />
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
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
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
            </FormProvider>
          </CasoFormProvider>
        </div>
      </Tabs>
    </CasoEditProvider>
  );
}

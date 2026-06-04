"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { CasoEditProvider } from "@/components/casos/edicao/caso-edit-context";
import { AbaAnotacoes } from "@/components/casos/edicao/anotacoes";
import { AbaRelacoes } from "@/components/casos/edicao/relacoes";
import { AbaClientes } from "@/components/casos/edicao/clientes";
import { AbaAnexos } from "@/components/casos/edicao/anexos";
import { AbaHistorico } from "@/components/casos/edicao/historico";
import { CasoEditCardClassificacao } from "@/components/casos/edicao/caso-edit-card-classificacao";
import { useCaseAttachments } from "@/hooks/casos/use-case-attachments";
import { useCasoHistorico } from "@/hooks/casos/use-caso-historico";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { buildCasoUpdatePayload } from "@/components/casos/shared/payload";
import { useStatus } from "@/hooks/catalogos/use-status";
import {
  normalizeAnaliseStatusForForm,
  resolveCasoStatusFromReport,
  resolveReportStatusFromCaso,
} from "@/components/casos/edicao/report-analise-modal/utils";
import { buildCasoEditSnapshot } from "@/components/casos/edicao/save/edit-snapshot";
import { computeCasoEditSave } from "@/components/casos/edicao/save/compute-caso-edit-save";
import { getUser } from "@/lib/auth";
import {
  applyDev631ToReportEditForm,
  deveAplicarDev631PorStatus,
  type Dev631SetValue,
} from "@/lib/report/apply-dev-631-form";

import { ReportEditHeader } from "./report-edit-header";
import { ReportEditRodapeAcoes } from "./report-edit-rodape-acoes";
import { ReportEditColunaDireita } from "./report-edit-coluna-direita";
import { AbaInicial } from "./abas/aba-inicial";
import { reportEditFormSchema, type ReportEditFormData } from "./schema";
import {
  getReportEditDefaultValues,
  reportEditFallbackDefaults,
} from "./utils";

export interface ReportEditFormProps {
  item: ProjetoMemoriaItem;
  casoId: string;
}

export function ReportEditForm({ item, casoId }: ReportEditFormProps) {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState("inicial");
  const [novaAnotacaoDraft, setNovaAnotacaoDraft] = useState("");

  const caso = item.caso;
  const numeroCaso = caso?.id ?? Number(casoId);
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

  const defaultValues = useMemo(() => getReportEditDefaultValues(item), [item]);
  const snapshotRef = useRef(buildCasoEditSnapshot(item));

  const methods = useForm<ReportEditFormData>({
    resolver: zodResolver(reportEditFormSchema),
    defaultValues: defaultValues ?? reportEditFallbackDefaults,
  });

  const previousStatusValueRef = useRef(String(defaultValues.status ?? ""));
  const previousAnaliseStatusValueRef = useRef(
    String(defaultValues.analiseStatus ?? ""),
  );

  useEffect(() => {
    const values = getReportEditDefaultValues(item);
    snapshotRef.current = buildCasoEditSnapshot(item);
    methods.reset(values);
    previousStatusValueRef.current = String(values.status ?? "");
    previousAnaliseStatusValueRef.current = String(values.analiseStatus ?? "");
  }, [item, methods]);

  // const statusValue = useWatch({ control: methods.control, name: "status" });
  // const analiseStatusValue = useWatch({
  //   control: methods.control,
  //   name: "analiseStatus",
  // });
  const versaoValue = useWatch({ control: methods.control, name: "versao" });
  const produtoWatch = methods.watch("produto");

  const { data: statusList } = useStatus();
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

  const handleSalvar = methods.handleSubmit(
    async (formData: ReportEditFormData) => {
      try {
        console.log("data", formData);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erro ao atualizar report.",
        );
      }
    },
  );

  const canEditCase = !rbacReady || hasPermission("edit-report");

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
      getReportStatusFromCasoStatus: getReportStatusFromCasoStatus,
      novaAnotacaoDraft,
      setNovaAnotacaoDraft,
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
        <ReportEditHeader
          countAnotacoes={countAnotacoes}
          countRelacoes={countRelacoes}
          countClientes={countClientes}
          countAnexos={countAnexos}
          countHistorico={countHistorico}
          showAnexosTab={showAnexosTab}
        />

        <div className="mt-4 flex-1 flex flex-col min-h-0 overflow-auto">
          <CasoFormProvider value={providerValue}>
            <FormProvider {...methods}>
              <div className="flex-1 pb-24">
                <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
                  <div className="flex min-h-0 flex-1 min-w-0 flex-col gap-6">
                    <TabsContent
                      value="inicial"
                      className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                    >
                      <fieldset
                        disabled={!canEditCase}
                        className="contents"
                        aria-disabled={!canEditCase}
                      >
                        <AbaInicial />
                      </fieldset>
                    </TabsContent>

                    <TabsContent
                      value="anotacoes"
                      className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                    >
                      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
                        <AbaAnotacoes
                          report={item.caso.textos.descricao_completa ?? ""}
                          anotacoes={anotacoes ?? []}
                        />
                      </div>
                    </TabsContent>

                    {showAnexosTab && (
                      <TabsContent
                        value="anexos"
                        className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                      >
                        <div className="flex flex-1 flex-col gap-6 min-w-0">
                          <AbaAnexos casoRegistro={numeroCaso} />
                        </div>
                      </TabsContent>
                    )}

                    <TabsContent
                      value="clientes"
                      className="mt-0 flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden"
                    >
                      <div className="flex-1 flex flex-col gap-6 min-w-0">
                        <AbaClientes
                          clientes={clientes ?? []}
                          isTabActive={tabValue === "clientes"}
                        />
                        <CasoEditCardClassificacao />
                      </div>
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

                  {tabValue === "inicial" && (
                    <fieldset
                      disabled={!canEditCase}
                      className="contents"
                      aria-disabled={!canEditCase}
                    >
                      <ReportEditColunaDireita item={item} />
                    </fieldset>
                  )}
                </div>
              </div>

              <ReportEditRodapeAcoes />
            </FormProvider>
          </CasoFormProvider>
        </div>
      </Tabs>
    </CasoEditProvider>
  );
}

"use client";



import { useCallback, useEffect, useMemo } from "react";
import { useQueryState } from "nuqs";

import { zodResolver } from "@hookform/resolvers/zod";

import { FormProvider, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { CasoFormProvider } from "@/components/fields/caso-form-provider";

import { importanceOptions } from "@/mocks/teste";

import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

import { useSetores } from "@/hooks/catalogos/use-setores";

import { useSgpObjetivos } from "@/hooks/catalogos/use-sgp-objetivos";

import { useUpdateSgpCadastro } from "@/hooks/cadastros/use-update-sgp-cadastro";

import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

import {

  getProjetoCreateDefaultValues,

  projetoFormSchema,

  type ProjetoFormData,

} from "@/components/projetos/cadastro/schema";

import {

  buildUpdateSgpAberturaPayload,

  resolveObjetivoFormValue,

  sgpCadastroToFormValues,

} from "@/components/projetos/cadastro/utils";

import { Tabs, TabsContent } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";

import { ProjetoEditHeader } from "@/components/projetos/edicao/projeto-edit-header";

import { ProjetoEditRodapeAcoes } from "@/components/projetos/edicao/projeto-edit-rodape-acoes";

import { AbaAbertura } from "@/components/projetos/edicao/abas/aba-abertura";

import { AbaCronogramaTab } from "@/components/projetos/edicao/abas/aba-cronograma";

import { AbaEscopoTab } from "@/components/projetos/edicao/abas/aba-escopo";

import { AbaRiscoTab } from "@/components/projetos/edicao/abas/aba-risco";

import { AbaStakesTab } from "@/components/projetos/edicao/abas/aba-stakes";
import {
  PROJETO_EDIT_TABS,
  projetoEditTabParser,
  type ProjetoEditTab,
} from "@/components/projetos/edicao/projeto-edit-url-parsers";



export interface ProjetoEditFormProps {

  cadastro: SgpCadastroData;

  projetoId: string;

}



const FORM_ID = "projeto-edit-form";



const TAB_CONTENT_CLASS =

  "mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden";



export function ProjetoEditForm({ cadastro }: ProjetoEditFormProps) {

  const router = useRouter();

  const [activeTab, setActiveTabQuery] = useQueryState(
    "aba",
    projetoEditTabParser.withOptions({ history: "replace", shallow: false }),
  );

  const handleTabChange = useCallback(
    (value: string) => {
      if (!PROJETO_EDIT_TABS.includes(value as ProjetoEditTab)) return;
      void setActiveTabQuery(
        value === "abertura" ? null : (value as ProjetoEditTab),
      );
    },
    [setActiveTabQuery],
  );

  const { data: setores } = useSetores({ enabled: true });

  const updateProjeto = useUpdateSgpCadastro(cadastro.registro);

  const rbacReady = permissionsLoaded();

  const canEditProject = !rbacReady || hasPermission("edit-project");



  const objetivoDescricao = cadastro.objetivo?.trim() ?? "";

  const precisaResolverObjetivoPorDescricao =

    (!cadastro.objetivo_id || cadastro.objetivo_id <= 0) &&

    objetivoDescricao.length > 0;



  const { data: objetivosResponse } = useSgpObjetivos({

    search:

      precisaResolverObjetivoPorDescricao && objetivoDescricao.length >= 2

        ? objetivoDescricao

        : undefined,

    enabled: precisaResolverObjetivoPorDescricao,

  });

  const objetivos = useMemo(

    () => objetivosResponse?.data ?? [],

    [objetivosResponse?.data],

  );



  const methods = useForm<ProjetoFormData>({

    resolver: zodResolver(projetoFormSchema),

    defaultValues: getProjetoCreateDefaultValues(),

  });



  const objetivoFallback = useMemo(() => {

    const label = cadastro.objetivo?.trim();

    if (!label) return undefined;

    const value = resolveObjetivoFormValue(cadastro, objetivos) || label;

    return { value, label };

  }, [cadastro, objetivos]);



  useEffect(() => {

    if (!cadastro) return;

    methods.reset(sgpCadastroToFormValues(cadastro, setores, objetivos));

  }, [cadastro, setores, objetivos, methods]);



  const isSavingAbertura =

    methods.formState.isSubmitting || updateProjeto.isPending;



  async function onSubmit(data: ProjetoFormData) {

    if (!canEditProject) {

      toast.error("Você não possui permissão para editar este projeto.");

      return;

    }



    const objetivoRaw = data.objetivo?.trim();

    if (objetivoRaw && !/^\d+$/.test(objetivoRaw)) {

      toast.error("Selecione um objetivo válido na lista antes de salvar.");

      return;

    }



    try {

      const payload = buildUpdateSgpAberturaPayload(data, cadastro);

      const response = await updateProjeto.mutateAsync({

        id: cadastro.registro,

        data: payload,

      });

      toast.success(response.message ?? "Projeto atualizado com sucesso.");

      if (response.data) {

        methods.reset(

          sgpCadastroToFormValues(response.data, setores, objetivos),

        );

      }

    } catch (error) {

      toast.error(

        error instanceof Error ? error.message : "Erro ao atualizar projeto.",

      );

    }

  }



  const exibirRodapeAcoes = activeTab === "abertura";



  const providerValue = useMemo(

    () => ({

      form: methods,

      importanceOptions,

      isDisabled: isSavingAbertura || !canEditProject,

      lazyLoadComboboxOptions: false,

    }),

    [methods, isSavingAbertura, canEditProject],

  );



  return (

    <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">

      <CasoFormProvider value={providerValue}>

        <FormProvider {...methods}>

          <Tabs

            value={activeTab}

            onValueChange={handleTabChange}

            className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"

          >

            <ProjetoEditHeader
              projetoId={cadastro.registro}
              nomeProjeto={
                methods.watch("nomeProjeto") ?? cadastro.nome_projeto ?? ""
              }
            />



            <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto">

              <div

                className={cn(

                  "flex-1",

                  exibirRodapeAcoes ? "pb-24" : "pb-12",

                )}

              >

                <TabsContent value="abertura" className={TAB_CONTENT_CLASS}>

                  <div className="flex min-h-0 flex-1 flex-col gap-6 min-w-0">

                    <form

                      id={FORM_ID}

                      onSubmit={methods.handleSubmit(onSubmit)}

                      className="min-h-0"

                    >

                      <AbaAbertura objetivoFallback={objetivoFallback} />

                    </form>

                  </div>

                </TabsContent>



                <TabsContent value="stakes" className={TAB_CONTENT_CLASS}>

                  <div className="flex min-h-0 flex-1 flex-col gap-2 min-w-0">

                    <AbaStakesTab

                      projetoId={cadastro.registro}

                      enabled={activeTab === "stakes"}

                    />

                  </div>

                </TabsContent>



                <TabsContent value="cronograma" className={TAB_CONTENT_CLASS}>

                  <div className="flex min-h-0 flex-1 flex-col min-w-0">

                    <AbaCronogramaTab

                      projetoId={cadastro.registro}

                      enabled={activeTab === "cronograma"}

                    />

                  </div>

                </TabsContent>



                <TabsContent value="escopo" className={TAB_CONTENT_CLASS}>

                  <div className="flex min-h-0 flex-1 flex-col min-w-0">

                    <AbaEscopoTab

                      projetoId={cadastro.registro}

                      enabled={activeTab === "escopo"}

                    />

                  </div>

                </TabsContent>



                <TabsContent value="risco" className={TAB_CONTENT_CLASS}>

                  <div className="flex min-h-0 flex-1 flex-col gap-2 min-w-0">

                    <AbaRiscoTab

                      projetoId={cadastro.registro}

                      enabled={activeTab === "risco"}

                    />

                  </div>

                </TabsContent>

              </div>

            </div>

          </Tabs>



          {exibirRodapeAcoes && (

            <ProjetoEditRodapeAcoes

              formId={FORM_ID}

              registro={cadastro.registro}

              nomeProjeto={

                methods.watch("nomeProjeto") ?? cadastro.nome_projeto ?? ""

              }

              isSaving={isSavingAbertura}

              canEdit={canEditProject}

              onCancelar={() => router.push("/projetos")}

            />

          )}

        </FormProvider>

      </CasoFormProvider>

    </div>

  );

}


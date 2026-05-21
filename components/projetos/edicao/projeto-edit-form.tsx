"use client";

import { useEffect, useMemo, useState } from "react";
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
import { AbaPlaceholder } from "@/components/projetos/edicao/abas/aba-placeholder";
import { AbaStakesTab } from "@/components/projetos/edicao/abas/aba-stakes";

export interface ProjetoEditFormProps {
  cadastro: SgpCadastroData;
  projetoId: string;
}

const FORM_ID = "projeto-edit-form";

export function ProjetoEditForm({ cadastro }: ProjetoEditFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("abertura");
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

  const isSaving =
    methods.formState.isSubmitting || updateProjeto.isPending;

  async function onSubmit(data: ProjetoFormData) {
    if (!canEditProject) {
      toast.error("Você não possui permissão para editar este projeto.");
      return;
    }

    const objetivoRaw = data.objetivo?.trim();
    if (objetivoRaw && !/^\d+$/.test(objetivoRaw)) {
      toast.error(
        "Selecione um objetivo válido na lista antes de salvar.",
      );
      return;
    }

    try {
      const payload = buildUpdateSgpAberturaPayload(data, cadastro);
      const response = await updateProjeto.mutateAsync({
        id: cadastro.registro,
        data: payload,
      });
      toast.success(
        response.message ?? "Projeto atualizado com sucesso.",
      );
      if (response.data) {
        methods.reset(
          sgpCadastroToFormValues(response.data, setores, objetivos),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar projeto.",
      );
    }
  }

  const exibirRodapeAcoes = activeTab === "abertura";

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      isDisabled: isSaving || !canEditProject,
      lazyLoadComboboxOptions: false,
    }),
    [methods, isSaving, canEditProject],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form
            id={FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ProjetoEditHeader />

            <div
              className={cn(
                "mt-6 min-h-0 flex-1 overflow-auto",
                exibirRodapeAcoes && "pb-24",
              )}
            >
              <TabsContent value="abertura" className="mt-0">
                <AbaAbertura objetivoFallback={objetivoFallback} />
              </TabsContent>
              <TabsContent value="stakes" className="mt-0">
                <AbaStakesTab
                  projetoId={cadastro.registro}
                  enabled={activeTab === "stakes"}
                />
              </TabsContent>
              <TabsContent value="cronograma" className="mt-0">
                <AbaPlaceholder titulo="Cronograma" />
              </TabsContent>
              <TabsContent value="escopo" className="mt-0">
                <AbaPlaceholder titulo="Escopo" />
              </TabsContent>
              <TabsContent value="risco" className="mt-0">
                <AbaPlaceholder titulo="Risco" />
              </TabsContent>
            </div>
          </Tabs>

          {exibirRodapeAcoes && (
            <ProjetoEditRodapeAcoes
              formId={FORM_ID}
              registro={cadastro.registro}
              nomeProjeto={
                methods.watch("nomeProjeto") ?? cadastro.nome_projeto ?? ""
              }
              isSaving={isSaving}
              canEdit={canEditProject}
              onCancelar={() => router.push("/projetos")}
            />
          )}
          </form>
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}

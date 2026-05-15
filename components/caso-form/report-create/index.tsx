"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SuccessModal } from "@/components/reports-form/success-modal";
import { AssistantModal } from "@/components/caso-form/assistant-modal";
import { CreateFormHeader } from "@/components/caso-form/shared/create-form-header";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { getUser } from "@/lib/auth";
import { useAssistant } from "@/hooks/assistant/use-assistant";
import { useCreateCaso } from "@/hooks/casos/use-create-caso";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { ReportCreateLeftColumn } from "./report-create-left-column";
import { ReportCreateRightColumn } from "./report-create-right-column";
import { reportCreateFormSchema, type ReportCreateFormData } from "./schema";
import { buildReportCreatePayload } from "./utils";
import {
  assistantFormSchema,
  type AssistantFormData,
} from "@/components/caso-form/caso-create/schema";

export function ReportCreateForm() {
  const router = useRouter();
  const user = getUser();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [numeroReport, setNumeroReport] = useState<number | null>(null);

  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<AssistantFormData>({
    resolver: zodResolver(assistantFormSchema),
  });

  const methods = useForm<ReportCreateFormData>({
    resolver: zodResolver(reportCreateFormSchema),
    defaultValues: {
      produto: "",
      categoria: "",
      categoriaTipoLabel: "",
      importancia: "",
      reportOcorrenciaInicial: "",
      DescricaoResumo: "",
      DescricaoCompleta: "",
      reportAnaliseUsuarioId: "",
      reportResponsavelSuporteId: "",
    },
  });

  const { mutateAsync: assistantMutateAsync, isPending: isAssistantPending } =
    useAssistant();
  const { mutateAsync: createCasoAsync, isPending: isCreating } =
    useCreateCaso();
  const { data: relatores } = useRelatores({ enabled: true });

  const isSubmitting = methods.formState.isSubmitting;
  const produto = methods.watch("produto");

  function resetFormForNovoReport() {
    methods.reset({
      ...methods.getValues(),
      categoria: "",
      categoriaTipoLabel: "",
      importancia: "3",
      reportOcorrenciaInicial: "",
      DescricaoResumo: "",
      DescricaoCompleta: "",
      reportAnaliseUsuarioId: "",
      reportResponsavelSuporteId: "",
    });
  }

  useEffect(() => {
    if (!user?.id || !Array.isArray(relatores) || relatores.length === 0)
      return;

    const responsavelAtual = String(
      methods.getValues("reportResponsavelSuporteId") ?? "",
    ).trim();
    if (responsavelAtual) return;

    const usuarioLogado = relatores.find(
      (item) => String(item.id) === String(user.id),
    );
    const supervisorId = String(usuarioLogado?.supervisor_id ?? "").trim();
    if (!supervisorId) return;

    methods.setValue("reportResponsavelSuporteId", supervisorId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [methods, relatores, user?.id]);

  async function onAssistantSubmit(
    data: AssistantFormData & {
      audio?: { blob: Blob; url: string; duration: number } | null;
    },
  ) {
    try {
      const submitData: { description?: string; audio?: Blob } = {};

      if (data.description && data.description.trim()) {
        submitData.description = data.description;
      }

      if (data.audio?.blob) {
        submitData.audio = data.audio.blob;
      }

      if (!submitData.description && !submitData.audio) {
        toast.error(
          "Por favor, forneça uma descrição em texto ou grave um áudio",
        );
        return;
      }

      const response = await assistantMutateAsync(submitData);
      if (response.data.title && response.data.description) {
        methods.setValue("DescricaoResumo", response.data.title);
        methods.setValue("DescricaoCompleta", response.data.description);
      }

      if (response.data.product) {
        methods.setValue("produto", String(response.data.product.id));
      }

      if (response.data.users?.[0]?.id) {
        methods.setValue(
          "reportAnaliseUsuarioId",
          String(response.data.users[0].id),
        );
      }

      reset();
      setIsAssistantModalOpen(false);

      toast.success("Dados preenchidos com sucesso");
    } catch (error) {
      console.error(error);

      let errorMessage = "Erro ao processar a solicitação. Tente novamente.";
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as {
          error?: string;
          message?: string;
        };
        if (apiError.error) {
          errorMessage = apiError.error;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      toast.error(errorMessage);
    }
  }

  async function onSubmit(data: ReportCreateFormData) {
    if (!createCasoAsync) return;

    try {
      if (!data.categoriaTipoLabel?.trim()) {
        toast.error("Selecione uma categoria válida para o report.");
        return;
      }

      const payload = buildReportCreatePayload({
        data,
        userId: user?.id,
      });
      const response = await createCasoAsync(payload);
      const registro = response?.data?.registro;

      if (!registro) {
        toast.error("Report criado, mas não foi possível obter o número.");
        return;
      }

      setNumeroReport(registro);
      setSuccessModalOpen(true);
      resetFormForNovoReport();
    } catch (error) {
      console.error("Erro ao abrir report:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao abrir report.",
      );
    }
  }

  const providerValue = {
    form: methods,
    importanceOptions,
    produto,
    isDisabled: isSubmitting || isCreating,
  };

  return (
    <div className="flex-1 overflow-auto px-6 pb-10 pt-20">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CreateFormHeader
              title="Adicionar Novo Report"
              description="Preencha os campos abaixo para abrir um novo report"
              onBack={() => router.back()}
              onLimparFormulario={() => methods.reset()}
              onOpenAssistant={() => setIsAssistantModalOpen(true)}
              assistantDisabled={isCreating}
            />

            <div className="flex flex-col gap-6 lg:flex-row">
              <ReportCreateLeftColumn />
              <ReportCreateRightColumn
                isSubmitting={isSubmitting}
                isCreating={isCreating}
              />
            </div>
          </form>
          <SuccessModal
            isOpen={successModalOpen}
            onClose={() => {
              setSuccessModalOpen(false);
              setNumeroReport(null);
            }}
            numeroCaso={numeroReport}
            entitySingular="Report"
            novoRegistroButtonLabel="Novo report"
            onNovoCasoClick={() => resetFormForNovoReport()}
          />
        </FormProvider>
      </CasoFormProvider>

      <AssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onAssistantSubmit}
        isRecording={false}
        onToggleRecording={() => {}}
        isAssistantSubmitting={isAssistantPending}
      />
    </div>
  );
}

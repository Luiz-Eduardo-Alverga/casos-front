"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AssistantModal } from "@/components/casos/shared/assistant-modal";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { importanceOptions } from "@/mocks/teste";
import { getUser } from "@/lib/auth";
import { useAssistant } from "@/hooks/assistant/use-assistant";
import { useCreateCaso } from "@/hooks/casos/use-create-caso";
import { useUploadCaseAttachmentsBatch } from "@/hooks/casos/use-case-attachments";
import {
  clearAberturaStats,
  getIgnoreAutoFill,
  incrementAberturaStats,
  setIgnoreAutoFill,
} from "@/lib/casos-abertura-rapida-storage";
import { CreateFormHeaderActions } from "@/components/casos/shared/create-form-header";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import {
  assistantFormSchema,
  casoCreateFormSchema,
  type AssistantFormData,
  type CasoCreateFormData,
} from "./schema";
import { CasoCreateLeftColumn } from "./caso-create-left-column";
import { CasoCreateModals } from "./caso-create-modals";
import { CasoCreateRightColumn } from "./caso-create-right-column";
import { buildCasoCreatePayload, clearTextOnlyFields } from "./utils";

export type { AssistantFormData, CasoCreateFormData } from "./schema";

export function CasoCreateForm() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numeroCaso, setNumeroCaso] = useState<number | null>(null);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [showQuickModeConfirm, setShowQuickModeConfirm] = useState(false);
  const [naoPlanejado, setNaoPlanejado] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isAnexosModalOpen, setIsAnexosModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<AssistantFormData>({
    resolver: zodResolver(assistantFormSchema),
  });

  const user = getUser();

  const methods = useForm<CasoCreateFormData>({
    resolver: zodResolver(casoCreateFormSchema),
    defaultValues: {
      produto: "",
      importancia: "3",
      modulo: "",
      categoria: "4",
      devAtribuido: "",
      versao: "",
      projeto: "",
      origem: "4",
      relator: user ? String(user.id) : "",
      qaAtribuido: "",
      DescricaoResumo: "",
      DescricaoCompleta: "",
      InformacoesAdicionais: "",
    },
  });

  const produto = methods.watch("produto");
  const quickModeProdutoRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      setQuickMode(false);
    };
  }, []);

  const exitQuickMode = useCallback(() => {
    quickModeProdutoRef.current = null;
    setQuickMode(false);
    clearAberturaStats();
  }, []);

  useEffect(() => {
    if (!quickMode || quickModeProdutoRef.current === null) return;
    const atual = (produto ?? "").trim();
    const esperado = quickModeProdutoRef.current;
    if (atual !== esperado) {
      exitQuickMode();
    }
  }, [produto, quickMode, exitQuickMode]);

  const handleNovoCasoAfterSuccess = useCallback(() => {
    const produtoId = methods.getValues("produto")?.trim() || "";
    const versao = methods.getValues("versao")?.trim() || "";
    if (!produtoId || !versao) return;
    const { shouldPromptQuickMode } = incrementAberturaStats(produtoId, versao);
    if (shouldPromptQuickMode && !getIgnoreAutoFill()) {
      setShowQuickModeConfirm(true);
    }
  }, [methods]);

  const acceptQuickMode = () => {
    quickModeProdutoRef.current = methods.getValues("produto")?.trim() || "";
    setQuickMode(true);
    clearTextOnlyFields(methods.setValue);
    setShowQuickModeConfirm(false);
  };

  const refuseQuickMode = () => {
    quickModeProdutoRef.current = null;
    clearAberturaStats();
    setIgnoreAutoFill(true);
    setQuickMode(false);
    setShowQuickModeConfirm(false);
  };

  const { mutateAsync: assistantMutateAsync, isPending: isAssistantPending } =
    useAssistant();
  const { mutateAsync: createCasoAsync, isPending: isCreatingCaso } =
    useCreateCaso();
  const uploadAttachmentsBatch = useUploadCaseAttachmentsBatch();

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
        methods.setValue(
          "InformacoesAdicionais",
          response.data.additionalInformation,
        );
      }

      if (response.data.product) {
        methods.setValue("produto", response.data.product.id);
      }

      if (response.data.users) {
        methods.setValue("devAtribuido", response.data.users[0].id);
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

  async function onSubmit(data: CasoCreateFormData) {
    if (!createCasoAsync) return;

    try {
      const currentUser = getUser();
      const casoData = buildCasoCreatePayload({
        data,
        naoPlanejado,
        userId: currentUser?.id,
      });

      const response = await createCasoAsync(casoData);
      if (response?.data?.registro) {
        const registro = response.data.registro;
        setNumeroCaso(registro);

        if (attachmentFiles.length > 0) {
          try {
            await uploadAttachmentsBatch.mutateAsync({
              casoRegistro: registro,
              files: attachmentFiles,
            });
            toast.success(
              `${attachmentFiles.length} anexo(s) enviado(s) com sucesso.`,
            );
            setAttachmentFiles([]);
          } catch (uploadErr) {
            console.error(uploadErr);
            toast.error(
              uploadErr instanceof Error
                ? uploadErr.message
                : "Caso criado, mas falhou o envio dos anexos. Tente novamente.",
            );
          }
        }

        if (quickMode) {
          toast.success(
            `Caso ${registro} aberto. Preencha o próximo resumo e descrição.`,
            { duration: 3500 },
          );
          clearTextOnlyFields(methods.setValue);
        } else {
          setIsModalOpen(true);
          clearTextOnlyFields(methods.setValue);
        }
      } else {
        clearTextOnlyFields(methods.setValue);
      }
    } catch (error) {
      console.error("Erro ao criar caso:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar caso.",
      );
    }
  }

  const providerValue = {
    form: methods,
    importanceOptions,
    produto,
    isDisabled:
      methods.formState.isSubmitting ||
      isCreatingCaso ||
      uploadAttachmentsBatch.isPending,
  };

  const isSubmitting = methods.formState.isSubmitting;
  const anexosGloballyDisabled =
    isCreatingCaso || isSubmitting || uploadAttachmentsBatch.isPending;

  return (
    <ListagemPageLayout
      title="Adicionar Novo Caso"
      subtitle="Preencha os campos abaixo para criar um novo caso"
      className="flex-1 overflow-auto pb-12"
      actions={
        <CreateFormHeaderActions
          onBack={() => {
            setQuickMode(false);
            router.back();
          }}
          onLimparFormulario={() => {
            exitQuickMode();
            methods.reset();
            setNaoPlanejado(false);
            setAttachmentFiles([]);
            setIsAnexosModalOpen(false);
          }}
          onOpenAssistant={() => setIsAssistantModalOpen(true)}
          assistantDisabled={isCreatingCaso}
        />
      }
    >
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex min-h-0 flex-col gap-2 lg:flex-row">
                <CasoCreateLeftColumn
                  quickMode={quickMode}
                  attachmentCount={attachmentFiles.length}
                  onOpenAnexos={() => setIsAnexosModalOpen(true)}
                />

                <CasoCreateRightColumn
                  naoPlanejado={naoPlanejado}
                  onNaoPlanejadoChange={setNaoPlanejado}
                  isSubmitting={isSubmitting}
                  isCreatingCaso={isCreatingCaso}
                  isUploadingAttachments={uploadAttachmentsBatch.isPending}
                />
              </div>
            </div>

            <CasoCreateModals
              successModalOpen={isModalOpen}
              onSuccessModalClose={() => setIsModalOpen(false)}
              numeroCaso={numeroCaso}
              onNovoCasoClick={handleNovoCasoAfterSuccess}
              quickModeConfirmOpen={showQuickModeConfirm}
              onQuickModeConfirmOpenChange={setShowQuickModeConfirm}
              onAcceptQuickMode={acceptQuickMode}
              onRefuseQuickMode={refuseQuickMode}
              anexosModalOpen={isAnexosModalOpen}
              onAnexosModalOpenChange={setIsAnexosModalOpen}
              attachmentFiles={attachmentFiles}
              onAttachmentFilesChange={setAttachmentFiles}
              anexosDisabled={anexosGloballyDisabled}
            />
          </form>
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
    </ListagemPageLayout>
  );
}

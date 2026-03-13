"use client";

import { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useAssistant } from "@/hooks/use-assistant";
import { importanceOptions } from "@/mocks/teste";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useCreateCaso } from "@/hooks/use-create-caso";
import { AssistantModal } from "@/components/assistant-modal";
import {
  CasoFormProvider,
  CasoFormProduto,
  CasoFormVersao,
  CasoFormImportancia,
  CasoFormProjeto,
  CasoFormModulo,
  CasoFormOrigem,
  CasoFormCategoria,
  CasoFormRelator,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
  CasoFormDescricaoResumo,
  CasoFormDescricaoCompleta,
  CasoFormInformacoesAdicionais,
} from "@/components/caso-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  FileText,
  Bug,
  Package,
  Users,
  Check,
  RefreshCcw,
} from "lucide-react";
import { SuccessModal } from "@/components/reports-form/success-modal";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const assistantSFormSchema = z.object({
  description: z.string(),
});

const reportsFormSchema = z.object({
  produto: z
    .string({ required_error: "Produto é obrigatório" })
    .min(1, "Produto é obrigatório"),
  importancia: z
    .string({ required_error: "Importância é obrigatória" })
    .min(1, "Importância é obrigatória"),
  modulo: z.string({ required_error: "Módulo é obrigatório" }),
  categoria: z
    .string({ required_error: "Categoria é obrigatória" })
    .min(1, "Categoria é obrigatória"),
  devAtribuido: z
    .string({ required_error: "Dev atribuído é obrigatório" })
    .min(1, "Dev atribuído é obrigatório"),
  versao: z
    .string({ required_error: "Versão é obrigatória" })
    .min(1, "Versão é obrigatória"),
  projeto: z
    .string({ required_error: "Projeto é obrigatório" })
    .min(1, "Projeto é obrigatório"),
  origem: z
    .string({ required_error: "Origem é obrigatória" })
    .min(1, "Origem é obrigatória"),
  relator: z
    .string({ required_error: "Relator é obrigatório" })
    .min(1, "Relator é obrigatório"),
  qaAtribuido: z.string({ required_error: "QA atribuído é obrigatório" }),
  DescricaoResumo: z
    .string({ required_error: "Resumo é obrigatório" })
    .min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z
    .string({ required_error: "Descrição completa é obrigatória" })
    .min(1, "Descrição completa é obrigatória"),
  InformacoesAdicionais: z.string().optional(),
});

type ReportsFormData = z.infer<typeof reportsFormSchema>;

type AssistantFormData = z.infer<typeof assistantSFormSchema>;

export function Reports() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numeroCaso, setNumeroCaso] = useState<number | null>(null);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSFormSchema),
  });

  // Obter usuário logado para preencher relator por padrão
  const user = getUser();

  const methods = useForm<ReportsFormData>({
    resolver: zodResolver(reportsFormSchema),
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

  const { mutateAsync: assistantMutateAsync, isPending: isAssistantPending } =
    useAssistant();
  const { mutateAsync: createCasoAsync, isPending: isCreatingCaso } =
    useCreateCaso();

  async function onAssistantSubmit(
    data: AssistantFormData & {
      audio?: { blob: Blob; url: string; duration: number } | null;
    },
  ) {
    try {
      // Preparar dados para envio
      const submitData: { description?: string; audio?: Blob } = {};

      // Adicionar description se existir
      if (data.description && data.description.trim()) {
        submitData.description = data.description;
      }

      // Se houver áudio, incluir no envio
      if (data.audio?.blob) {
        submitData.audio = data.audio.blob;
      }

      // Validar que pelo menos description ou audio foi fornecido
      if (!submitData.description && !submitData.audio) {
        toast.error(
          "Por favor, forneça uma descrição em texto ou grave um áudio",
        );
        return;
      }

      const response = await assistantMutateAsync(submitData);
      console.log(response.data);
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

      // Extrair mensagem de erro da API
      let errorMessage = "Erro ao processar a solicitação. Tente novamente.";

      if (error instanceof AxiosError && error.response?.data) {
        // Verificar se há mensagem de erro específica da API
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

  async function onSubmit(data: ReportsFormData) {
    if (!createCasoAsync) return;

    try {
      // Extrair apenas a versão do campo versao (formato: "sequencia-versao-idx")
      const versaoProduto = data.versao
        ? data.versao.split("-")[1]?.trim() || data.versao
        : "";
      const user = getUser();

      // Mapear campos do front para a API
      const casoData = {
        Projeto: Number(data.produto),
        VersaoProduto: versaoProduto,
        Prioridade: Number(data.importancia),
        Cronograma_id: Number(data.projeto),
        Modulo: data.modulo || "",
        Id_Origem: data.origem || "",
        Categoria: Number(data.categoria),
        Relator: Number(data.relator),
        AtribuidoPara: Number(data.devAtribuido),
        QaId: Number(data.qaAtribuido),
        DescricaoResumo: data.DescricaoResumo || "",
        DescricaoCompleta: (data.DescricaoCompleta || "").replace(
          /\r?\n/g,
          "\r\n",
        ),
        InformacoesAdicionais: data.InformacoesAdicionais || "",
        status: "1",
        Id_Usuario_AberturaCaso: String(user?.id || ""),
      };

      const response = await createCasoAsync(casoData);
      // Armazenar o número do caso e abrir o modal
      if (response?.data?.registro) {
        setNumeroCaso(response.data.registro);
        setIsModalOpen(true);
      }
      // Resetar formulário após sucesso
      // methods.reset();
      methods.setValue("DescricaoResumo", "");
      methods.setValue("DescricaoCompleta", "");
      methods.setValue("InformacoesAdicionais", "");
    } catch (error) {
      console.error("Erro ao criar caso:", error);
    }
  }

  const providerValue = {
    form: methods,
    importanceOptions,
    produto,
    isDisabled: methods.formState.isSubmitting || isCreatingCaso,
  };

  return (
    <div className="px-6 pt-20 py-10 flex-1 overflow-auto">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Header com título, descrição e botões */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-text-primary">
                  Adicionar Novo Caso
                </h1>
                <p className="text-sm text-text-secondary">
                  Preencha os campos abaixo para criar um novo caso
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
                  onClick={() => {
                    router.push("/painel");
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
                  onClick={() => {
                    methods.reset();
                  }}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Limpar formulário
                </Button>

                <Button
                  type="button"
                  onClick={() => setIsAssistantModalOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90 px-4 flex-1 sm:flex-initial"
                  disabled={isCreatingCaso}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Assistente IA
                </Button>
              </div>
            </div>

            {/* Layout em duas colunas */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Coluna esquerda - maior */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Card Informações */}
                <Card className="bg-card shadow-card rounded-lg">
                  <CardHeader className="p-5 pb-2 border-b border-border-divider">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-text-primary" />
                      <CardTitle className="text-sm font-semibold text-text-primary">
                        Informações
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-3 space-y-4">
                    <CasoFormDescricaoResumo />
                    <CasoFormDescricaoCompleta />
                    <CasoFormInformacoesAdicionais />
                  </CardContent>
                </Card>

                {/* Card Classificação e Origem */}
                <Card className="bg-card shadow-card rounded-lg mt-auto">
                  <CardHeader className="p-5 pb-2 border-b border-border-divider">
                    <div className="flex items-center gap-2">
                      <Bug className="h-3.5 w-3.5 text-text-primary" />
                      <CardTitle className="text-sm font-semibold text-text-primary">
                        Classificação e Origem
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
                      <CasoFormImportancia />
                      <CasoFormOrigem />
                      <CasoFormCategoria />
                      <CasoFormRelator />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna direita - menor */}
              <div className="w-full lg:w-[362px] flex flex-col gap-6">
                {/* Card Dados do Produto */}
                <Card className="bg-card shadow-card rounded-lg">
                  <CardHeader className="p-5 pb-2 border-b border-border-divider">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-text-primary" />
                      <CardTitle className="text-sm font-semibold text-text-primary">
                        Dados do Produto
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-3 space-y-4">
                    <CasoFormProduto />
                    <CasoFormVersao />
                    <CasoFormModulo />
                    <CasoFormProjeto />
                  </CardContent>
                </Card>

                {/* Card Atribuição */}
                <Card className="bg-card shadow-card rounded-lg">
                  <CardHeader className="p-5 pb-2 border-b border-border-divider">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-text-primary" />
                      <CardTitle className="text-sm font-semibold text-text-primary">
                        Atribuição
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-3 space-y-4">
                    <CasoFormDevAtribuido />
                    <CasoFormQaAtribuido />
                  </CardContent>
                </Card>

                {/* Botão Criar Caso */}
                <div className="border border-border-accent rounded-lg p-5 bg-gradient-to-br from-bg-accent-start to-bg-accent-end">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreatingCaso || methods.formState.isSubmitting}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {isCreatingCaso || methods.formState.isSubmitting
                      ? "Criando Caso..."
                      : "Criar Caso"}
                  </Button>
                </div>
              </div>
            </div>

            <SuccessModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              numeroCaso={numeroCaso}
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
    </div>
  );
}

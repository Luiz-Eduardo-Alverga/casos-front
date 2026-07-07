"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Code2,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { useFormAssistantPrompts } from "@/hooks/assistant/use-form-assistant-prompts";
import { useCreateFormAssistantPrompt } from "@/hooks/assistant/use-create-form-assistant-prompt";
import { useUpdateFormAssistantPrompt } from "@/hooks/assistant/use-update-form-assistant-prompt";
import { useToggleFormAssistantPrompt } from "@/hooks/assistant/use-toggle-form-assistant-prompt";
import { useDeleteFormAssistantPrompt } from "@/hooks/assistant/use-delete-form-assistant-prompt";
import { ConfirmarExclusaoPapelModal } from "@/components/configuracoes/papeis/confirmar-exclusao-papel-modal";
import { PromptsIaDicasModal } from "./prompts-ia-dicas-modal";
import { getAppUser, getUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  template: z.string().min(1, "Template é obrigatório"),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface TemplateEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function TemplateEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const linesCount = Math.max(value.split("\n").length, 15);

  function syncScroll() {
    const ta = textareaRef.current;
    const linesEl = ta?.parentElement?.querySelector(
      "[data-lines]",
    ) as HTMLElement | null;
    if (ta && linesEl) {
      linesEl.scrollTop = ta.scrollTop;
    }
  }

  return (
    <div className="flex min-h-[260px] font-mono text-sm border-t border-border-divider">
      <div
        data-lines
        className="select-none overflow-hidden text-right text-text-secondary px-3 pt-3 border-r border-border-divider shrink-0 w-12 bg-muted/40"
      >
        {Array.from({ length: linesCount }, (_, i) => (
          <div key={i + 1} className="leading-6 text-xs">
            {i + 1}
          </div>
        ))}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 border-0 rounded-none bg-transparent resize-none font-mono text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[260px] px-4 py-3"
      />
    </div>
  );
}

interface PromptsIaFormProps {
  mode: "create" | "edit";
  promptId?: string;
}

export function PromptsIaForm({ mode, promptId }: PromptsIaFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const { data: prompts, isLoading: isLoadingPrompts } =
    useFormAssistantPrompts();

  const prompt = useMemo(() => {
    if (!isEdit || !promptId || !prompts) return null;
    return prompts.find((p) => p.id === promptId) ?? null;
  }, [isEdit, promptId, prompts]);

  const appUser = getAppUser();
  const legacyUser = getUser();
  const userSetor = appUser?.setor ?? legacyUser?.setor ?? "";

  const squadSetor = isEdit ? (prompt?.squadSetor ?? "—") : userSetor;
  const isDefault = isEdit ? prompt?.squadSetor === null : false;

  const createMutation = useCreateFormAssistantPrompt();
  const updateMutation = useUpdateFormAssistantPrompt();
  const toggleMutation = useToggleFormAssistantPrompt();
  const deleteMutation = useDeleteFormAssistantPrompt();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", template: "", isActive: true },
  });

  const templateValue = watch("template");
  const isActiveValue = watch("isActive");
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEdit && prompt) {
      reset({
        name: prompt.name,
        template: prompt.template,
        isActive: prompt.isActive,
      });
    }
  }, [isEdit, prompt, reset]);

  useEffect(() => {
    if (isEdit && !isLoadingPrompts && !prompt) {
      router.replace("/configuracoes/prompts-ia");
    }
  }, [isEdit, isLoadingPrompts, prompt, router]);

  function handleCancel() {
    router.push("/configuracoes/prompts-ia");
  }

  function handleToggleStatus(checked: boolean) {
    if (!prompt) return;
    toggleMutation.mutate(prompt.id, {
      onSuccess: (data) => {
        reset((prev) => ({ ...prev, isActive: data.isActive }));
        toast.success(data.isActive ? "Prompt ativado." : "Prompt desativado.");
      },
      onError: (err) => {
        toast.error(err.message || "Erro ao alternar status.");
      },
    });
  }

  function onSubmit(data: FormData) {
    if (isEdit) {
      if (!prompt) return;
      updateMutation.mutate(
        { id: prompt.id, body: { name: data.name, template: data.template } },
        {
          onSuccess: () => {
            toast.success("Prompt atualizado com sucesso.");
            router.push("/configuracoes/prompts-ia");
          },
          onError: (err) => {
            toast.error(err.message || "Erro ao atualizar prompt.");
          },
        },
      );
    } else {
      if (!squadSetor || !squadSetor.toUpperCase().startsWith("SQUAD")) {
        toast.error(
          "Seu setor não pertence a um squad. Apenas membros de squads podem criar prompts.",
        );
        return;
      }
      createMutation.mutate(
        { squadSetor, name: data.name, template: data.template },
        {
          onSuccess: () => {
            toast.success("Prompt criado com sucesso.");
            router.push("/configuracoes/prompts-ia");
          },
          onError: (err) => {
            toast.error(err.message || "Erro ao criar prompt.");
          },
        },
      );
    }
  }

  const isLoadingEdit = isEdit && isLoadingPrompts && !prompt;

  const rbacReady = permissionsLoaded();
  const canDelete = !rbacReady || hasPermission("delete-prompts");
  const canEdit = !rbacReady || hasPermission("edit-prompts");

  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [dicasModalOpen, setDicasModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleOpenDeleteModal() {
    if (!prompt || isDefault) return;
    setDeleteConfirmationText("");
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!prompt) return;

    try {
      await deleteMutation.mutateAsync(prompt.id);
      toast.success("Prompt excluído com sucesso.");
      setDeleteModalOpen(false);
      setDeleteConfirmationText("");
      router.push("/configuracoes/prompts-ia");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao excluir prompt.",
      );
    }
  }

  return (
    <ListagemPageLayout
      title={isEdit ? "Editar Prompt" : "Novo Prompt"}
      subtitle={
        isEdit
          ? "Edite o nome, template e status de ativação do prompt."
          : "Preencha os campos abaixo para criar um novo prompt personalizado para o squad. Nome e template são obrigatórios."
      }
    >
      <form
        id="prompt-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 pb-24"
      >
        {/* Card Informações */}
        <Card className="bg-card shadow-card rounded-lg shrink-0">
          <CardHeader className="p-4 pb-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Informações
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            {isLoadingEdit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-[72px]" />
                <Skeleton className="h-[72px]" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-text-label"
                    >
                      Nome do prompt <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Prompt Bug Tracker Frontend"
                      className="h-[42px] rounded-lg border-border-input"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">
                      Use um nome descritivo e único para identificar este
                      prompt.
                    </p>
                  </div>

                  {/* Squad (somente leitura) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-text-label">
                        Squad
                      </Label>
                      <div className="flex items-center gap-1 bg-muted rounded px-1.5 py-0.5">
                        <Lock className="h-3 w-3 text-text-secondary" />
                        <span className="text-xs text-text-secondary">
                          Somente leitura
                        </span>
                      </div>
                    </div>
                    <div className="h-[42px] rounded-lg border border-border-input bg-muted/50 flex items-center px-4 gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-primary">
                        {isDefault
                          ? "Prompt Padrão (Global)"
                          : squadSetor || "—"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {isEdit
                        ? "O squad não pode ser alterado após a criação."
                        : "O squad é definido automaticamente com base no seu Setor."}
                    </p>
                  </div>
                </div>

                {/* Toggle Status (somente edição) */}
                {isEdit && canEdit && (
                  <div className="flex items-center justify-between rounded-lg border border-border-divider bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        Status de ativação
                      </span>
                      {/* <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-muted cursor-help">
                              <span className="text-[10px] font-bold text-text-secondary leading-none">
                                ?
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-[220px]"
                          >
                            Quando inativo, o squad passa a usar o prompt
                            padrão. O prompt DEFAULT não pode ser desativado.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider> */}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-text-secondary">
                        {isActiveValue ? "Ativo" : "Inativo"}
                      </span>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleToggleStatus(checked);
                            }}
                            disabled={isDefault || toggleMutation.isPending}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Card Template */}
        <Card className="bg-card shadow-card rounded-lg shrink-0">
          <CardHeader className="p-4 pb-2 border-b border-border-divider">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-text-primary" />
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Template do prompt <span className="text-destructive">*</span>
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setDicasModalOpen(true)}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Dicas
              </Button>
            </div>
          </CardHeader>

          {isLoadingEdit ? (
            <div className="p-6">
              <Skeleton className="h-[260px]" />
            </div>
          ) : (
            <>
              <Controller
                name="template"
                control={control}
                render={({ field }) => (
                  <TemplateEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      "Escreva o template do prompt aqui...\n\nExemplo:\nVocê é um assistente especializado em triagem de casos de software para o squad.\n\nAnalise a solicitação abaixo e classifique como: bug, melhoria ou requisito.\n\nProdutos disponíveis: {{produtos}}\nUsuários: {{usuarios}}\n\nResponda seguindo o schema: {{schema_json}}"
                    }
                  />
                )}
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-border-divider text-xs text-text-secondary">
                {/* <span>
                  Variáveis:{" "}
                  {(() => {
                    const matches = templateValue.match(/\{\{[^}]+\}\}/g);
                    if (!matches || matches.length === 0)
                      return "nenhuma detectada";
                    const unique = [...new Set(matches)];
                    return unique.join(", ");
                  })()}
                </span> */}
                <span className="ml-auto">
                  {templateValue.length} caracteres
                </span>
              </div>
            </>
          )}
          {errors.template && (
            <p className="text-xs text-destructive px-4 pb-3">
              {errors.template.message}
            </p>
          )}
        </Card>

        {/* Card Dados injetados */}
        {/* <Card className="bg-card shadow-card rounded-lg shrink-0">
          <CardHeader className="p-4 pb-2 border-b border-border-divider">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Dados injetados pelo sistema
              </CardTitle>
              <Badge variant="outline" className="text-xs rounded-full ml-1">
                somente leitura
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="space-y-2 p-4 rounded-lg border border-border-divider bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Produtos
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-indigo-50 text-indigo-600"
                  >
                    {"{{produtos}}"}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Lista de produtos disponíveis na plataforma, injetada em tempo
                  de execução.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    "Smart (Softcom Smart)",
                    "SOFTCOMSHOP",
                    "PDV - Softshop Caixa",
                  ].map((p) => (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="text-xs rounded"
                    >
                      {p}
                    </Badge>
                  ))}
                  <Badge
                    variant="secondary"
                    className="text-xs rounded text-text-secondary"
                  >
                    + mais...
                  </Badge>
                </div>
              </div>

             
              <div className="space-y-2 p-4 rounded-lg border border-border-divider bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Usuários
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-indigo-50 text-indigo-600"
                  >
                    {"{{usuarios}}"}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Lista de membros ativos do squad vinculados ao sistema de
                  gestão.
                </p>
              </div>

              
              <div className="space-y-2 p-4 rounded-lg border border-border-divider bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Schema JSON
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs bg-indigo-50 text-indigo-600"
                  >
                    {"{{schema_json}}"}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Estrutura de saída esperada pelo sistema de triagem de casos.
                </p>
                <pre className="text-xs bg-card rounded p-2 border border-border-divider font-mono mt-1 text-text-primary">
                  {`{\n  "tipo": "bug",\n  "prioridade": "alta"\n}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {isEdit && !isDefault && !isLoadingEdit && canDelete && (
          <Card className="bg-card shadow-card rounded-lg shrink-0 border border-border-divider">
            <CardContent className="p-5">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-destructive">
                  Zona de Perigo
                </h3>
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-destructive">
                        Excluir este prompt
                      </p>
                      <p className="text-xs text-destructive">
                        Esta ação não pode ser desfeita. O squad passará a usar
                        o prompt padrão após a exclusão.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleOpenDeleteModal}
                      disabled={isPending || deleteMutation.isPending}
                      variant="destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir prompt
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      <PromptsIaDicasModal
        open={dicasModalOpen}
        onOpenChange={setDicasModalOpen}
      />

      {isEdit && prompt && (
        <ConfirmarExclusaoPapelModal
          open={deleteModalOpen}
          roleName={prompt.name}
          confirmationText={deleteConfirmationText}
          onConfirmationTextChange={setDeleteConfirmationText}
          isDeleting={deleteMutation.isPending}
          onOpenChange={(next) => {
            if (deleteMutation.isPending) return;
            setDeleteModalOpen(next);
            if (!next) setDeleteConfirmationText("");
          }}
          onConfirm={handleConfirmDelete}
          confirmationInputLabel="Insira o nome do prompt"
          confirmButtonLabel="Excluir prompt"
          description={`Deseja mesmo excluir o prompt "${prompt.name}"? Esta ação é irreversível.`}
        />
      )}

      {/* Footer fixo */}
      <footer
        className="fixed bottom-0 z-30 border-t border-border-divider bg-card shadow-card transition-all duration-300 px-6 py-4 flex flex-row justify-end items-center gap-2"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="w-48 px-4"
        >
          <X className="h-3.5 w-3.5 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          form="prompt-form"
          disabled={isPending || isLoadingEdit}
          className="w-48 px-4"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-2" />
          )}
          Salvar
        </Button>
      </footer>
    </ListagemPageLayout>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { useFormAssistantPrompts } from "@/hooks/assistant/use-form-assistant-prompts";
import { useCreateFormAssistantPrompt } from "@/hooks/assistant/use-create-form-assistant-prompt";
import { useUpdateFormAssistantPrompt } from "@/hooks/assistant/use-update-form-assistant-prompt";
import { useToggleFormAssistantPrompt } from "@/hooks/assistant/use-toggle-form-assistant-prompt";
import { useDeleteFormAssistantPrompt } from "@/hooks/assistant/use-delete-form-assistant-prompt";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { ConfirmarExclusaoPapelModal } from "@/components/configuracoes/papeis/confirmar-exclusao-papel-modal";
import { PromptsIaDicasModal } from "./prompts-ia-dicas-modal";
import {
  PROMPT_TYPE_OPTIONS,
  promptsIaTipoParsers,
} from "./prompts-ia-tipo-parsers";
import { getAppUser, getUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import type {
  CreateFormAssistantPromptRequest,
  PromptType,
} from "@/lib/types/form-assistant-prompts";

const GLOBAL_SQUAD_VALUE = "__global__";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  template: z.string().min(1, "Template é obrigatório"),
  isActive: z.boolean(),
  squadSetor: z.string().optional(),
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
  const [tipo, setTipo] = useQueryState("tipo", promptsIaTipoParsers.tipo);

  const { data: prompts, isLoading: isLoadingPrompts } =
    useFormAssistantPrompts(tipo);

  const prompt = useMemo(() => {
    if (!isEdit || !promptId || !prompts) return null;
    return prompts.find((p) => p.id === promptId) ?? null;
  }, [isEdit, promptId, prompts]);

  const effectiveTipo: PromptType =
    isEdit && prompt?.tipo ? prompt.tipo : tipo;
  const isReleaseNotes = effectiveTipo === "RELEASE_NOTES";
  const listHref = `/configuracoes/prompts-ia?tipo=${effectiveTipo}`;

  const { data: setores } = useSetores({ enabled: isReleaseNotes && !isEdit });

  const appUser = getAppUser();
  const legacyUser = getUser();
  const userSetor = appUser?.setor ?? legacyUser?.setor ?? "";

  const formAssistantSquad = isEdit ? (prompt?.squadSetor ?? "—") : userSetor;
  const isDefault = isEdit ? prompt?.squadSetor === null : false;

  const squadOptions = useMemo(() => {
    const list = setores ?? [];
    return list
      .filter((s) => s.nome.toUpperCase().startsWith("SQUAD"))
      .map((s) => s.nome)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [setores]);

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
    defaultValues: {
      name: "",
      template: "",
      isActive: true,
      squadSetor: GLOBAL_SQUAD_VALUE,
    },
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
        squadSetor: prompt.squadSetor ?? GLOBAL_SQUAD_VALUE,
      });
      if (prompt.tipo !== tipo) {
        void setTipo(prompt.tipo);
      }
    }
  }, [isEdit, prompt, reset, tipo, setTipo]);

  useEffect(() => {
    if (isEdit && !isLoadingPrompts && !prompt) {
      router.replace(listHref);
    }
  }, [isEdit, isLoadingPrompts, prompt, router, listHref]);

  function handleTipoChange(next: PromptType) {
    if (isEdit) return;
    void setTipo(next);
    if (next === "RELEASE_NOTES") {
      reset((prev) => ({ ...prev, squadSetor: GLOBAL_SQUAD_VALUE }));
    }
  }

  function handleCancel() {
    router.push(listHref);
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
            router.push(listHref);
          },
          onError: (err) => {
            toast.error(err.message || "Erro ao atualizar prompt.");
          },
        },
      );
      return;
    }

    if (effectiveTipo === "FORM_ASSISTANT") {
      if (!userSetor || !userSetor.toUpperCase().startsWith("SQUAD")) {
        toast.error(
          "Seu setor não pertence a um squad. Apenas membros de squads podem criar prompts.",
        );
        return;
      }
      createMutation.mutate(
        {
          tipo: effectiveTipo,
          squadSetor: userSetor,
          name: data.name,
          template: data.template,
        },
        {
          onSuccess: () => {
            toast.success("Prompt criado com sucesso.");
            router.push(listHref);
          },
          onError: (err) => {
            toast.error(err.message || "Erro ao criar prompt.");
          },
        },
      );
      return;
    }

    const body: CreateFormAssistantPromptRequest = {
      tipo: effectiveTipo,
      name: data.name,
      template: data.template,
    };

    const selectedSquad = data.squadSetor;
    if (selectedSquad && selectedSquad !== GLOBAL_SQUAD_VALUE) {
      if (!selectedSquad.toUpperCase().startsWith("SQUAD")) {
        toast.error('O squad deve começar com "SQUAD".');
        return;
      }
      body.squadSetor = selectedSquad;
    }

    createMutation.mutate(body, {
      onSuccess: () => {
        toast.success("Prompt criado com sucesso.");
        router.push(listHref);
      },
      onError: (err) => {
        toast.error(err.message || "Erro ao criar prompt.");
      },
    });
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
      router.push(listHref);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao excluir prompt.",
      );
    }
  }

  const subtitle = isEdit
    ? "Edite o nome, template e status de ativação do prompt."
    : isReleaseNotes
      ? "Crie um modelo de prompt para o registro de liberação. Squad é opcional."
      : "Preencha os campos abaixo para criar um novo prompt personalizado para o squad. Nome e template são obrigatórios.";

  const templatePlaceholder = isReleaseNotes
    ? "Escreva o template do registro de liberação...\n\nUse os placeholders:\n{{produto}} — nome do produto\n{{versoes}} — versões da liberação\n{{ticketsList}} — lista de casos/tickets"
    : "Escreva o template do prompt aqui...\n\nExemplo:\nVocê é um assistente especializado em triagem de casos de software para o squad.\n\nAnalise a solicitação abaixo e classifique como: bug, melhoria ou requisito.\n\nProdutos disponíveis: {{produtos}}\nUsuários: {{usuarios}}\n\nResponda seguindo o schema: {{schema_json}}";

  return (
    <ListagemPageLayout
      title={isEdit ? "Editar Prompt" : "Novo Prompt"}
      subtitle={subtitle}
    >
      <form
        id="prompt-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 pb-24"
      >
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-text-label">
                      Tipo <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={effectiveTipo}
                      onValueChange={(value) =>
                        handleTipoChange(value as PromptType)
                      }
                      disabled={isEdit}
                    >
                      <SelectTrigger className="h-[42px] rounded-lg border-border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMPT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-text-secondary">
                      {isEdit
                        ? "O tipo não pode ser alterado após a criação."
                        : "Define o fluxo e os campos disponíveis neste formulário."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-text-label"
                    >
                      Nome do prompt <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder={
                        isReleaseNotes
                          ? "Ex: Registro de Liberação - Squad XP"
                          : "Ex: Prompt Bug Tracker Frontend"
                      }
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

                  {isReleaseNotes && !isEdit ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-text-label">
                        Squad
                      </Label>
                      <Controller
                        name="squadSetor"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || GLOBAL_SQUAD_VALUE}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-[42px] rounded-lg border-border-input">
                              <SelectValue placeholder="Global (sem squad)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={GLOBAL_SQUAD_VALUE}>
                                Global (sem squad)
                              </SelectItem>
                              {squadOptions.map((nome) => (
                                <SelectItem key={nome} value={nome}>
                                  {nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-text-secondary">
                        Opcional. Sem squad, o prompt fica global. Pode existir
                        mais de um prompt por squad.
                      </p>
                    </div>
                  ) : (
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
                            ? isReleaseNotes
                              ? "Global (DEFAULT)"
                              : "Prompt Padrão (Global)"
                            : isEdit
                              ? (prompt?.squadSetor ?? "—")
                              : formAssistantSquad || "—"}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {isEdit
                          ? "O squad não pode ser alterado após a criação."
                          : "O squad é definido automaticamente com base no seu Setor."}
                      </p>
                    </div>
                  )}
                </div>

                {isEdit && canEdit && (
                  <div className="flex items-center justify-between rounded-lg border border-border-divider bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        Status de ativação
                      </span>
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

        <Card className="bg-card shadow-card rounded-lg shrink-0">
          <CardHeader className="p-4 pb-2 border-b border-border-divider">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-text-primary" />
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Template do prompt <span className="text-destructive">*</span>
                </CardTitle>
              </div>
              {!isReleaseNotes && (
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
              )}
            </div>
          </CardHeader>

          {isReleaseNotes && (
            <div className="mx-4 mt-3 rounded-lg border border-border-divider bg-muted/30 px-3 py-2 text-xs text-text-secondary">
              Mantém os placeholders{" "}
              <code className="font-mono text-foreground">{"{{produto}}"}</code>
              ,{" "}
              <code className="font-mono text-foreground">{"{{versoes}}"}</code>{" "}
              e{" "}
              <code className="font-mono text-foreground">
                {"{{ticketsList}}"}
              </code>
              . Eles são preenchidos automaticamente pelo backend na geração.
            </div>
          )}

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
                    placeholder={templatePlaceholder}
                  />
                )}
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-border-divider text-xs text-text-secondary">
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
                        Esta ação não pode ser desfeita.
                        {isReleaseNotes
                          ? " Prompts desativados deixam de aparecer no seletor de geração."
                          : " O squad passará a usar o prompt padrão após a exclusão."}
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

      {!isReleaseNotes && (
        <PromptsIaDicasModal
          open={dicasModalOpen}
          onOpenChange={setDicasModalOpen}
        />
      )}

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

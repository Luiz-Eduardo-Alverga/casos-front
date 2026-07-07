"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Copy,
  Loader2,
  MoreHorizontal,
  Save,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteSgpCadastro } from "@/hooks/cadastros/use-delete-sgp-cadastro";

const TAB_TRIGGER_CLASS = cn(
  "group shrink-0 rounded-full px-3 py-1.5 text-sm font-medium gap-1.5",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
);

const TABS = [
  { value: "abertura", label: "Abertura" },
  { value: "stakes", label: "Stakes" },
  { value: "cronograma", label: "Cronograma" },
  { value: "escopo", label: "Escopo" },
  { value: "risco", label: "Risco" },
] as const;

function handleEmBreve() {
  toast("Em breve");
}

export interface ProjetoEditHeaderProps {
  projetoId: number;
  nomeProjeto?: string;
  formId?: string;
  isSaving?: boolean;
  canEdit?: boolean;
  showSalvar?: boolean;
}

export function ProjetoEditHeader({
  projetoId,
  nomeProjeto,
  formId,
  isSaving = false,
  canEdit = true,
  showSalvar = false,
}: ProjetoEditHeaderProps) {
  const router = useRouter();
  const deleteProjeto = useDeleteSgpCadastro();
  const [excluirProjetoModal, setExcluirProjetoModal] = useState(false);

  const rbacReady = permissionsLoaded();
  const canDeleteProject = !rbacReady || hasPermission("edit-project");

  const nomeExibicao = nomeProjeto?.trim() || `projeto #${projetoId}`;
  const salvarDisabled = isSaving || !canEdit;
  const showSemPermissaoTooltip = !canEdit && !isSaving;

  const handleExcluirProjeto = async () => {
    try {
      const response = await deleteProjeto.mutateAsync(projetoId);
      toast.success(response.message ?? "Projeto excluído com sucesso.");
      router.push("/projetos");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir projeto.",
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="flex shrink-0 flex-col gap-2 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TabsList
            className={cn(
              "flex h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-card py-1 text-muted-foreground",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={TAB_TRIGGER_CLASS}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex w-full shrink-0 flex-row items-center gap-1.5 lg:w-[362px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="Mais ações"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleEmBreve}>
                <Copy className="mr-2 h-4 w-4" />
                Clonar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setExcluirProjetoModal(true)}
                disabled={deleteProjeto.isPending || !canDeleteProject}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-0 flex-1 px-2"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Voltar</span>
          </Button>

          {showSalvar ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="min-w-0 flex-1">
                  <Button
                    type="submit"
                    form={formId}
                    disabled={salvarDisabled}
                    className="h-9 w-full min-w-0 flex-1 px-2"
                    aria-disabled={salvarDisabled}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                        <span className="truncate">Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Salvar</span>
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {showSemPermissaoTooltip && (
                <TooltipContent>
                  Você não possui permissão para editar este projeto.
                </TooltipContent>
              )}
            </Tooltip>
          ) : null}
        </div>
      </div>

      <ConfirmacaoModal
        open={excluirProjetoModal}
        onOpenChange={setExcluirProjetoModal}
        titulo="Excluir projeto"
        descricao={`Tem certeza que deseja excluir o projeto "${nomeExibicao}"? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirProjeto}
        variant="danger"
        isLoading={deleteProjeto.isPending}
      />
    </TooltipProvider>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
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
}

export function ProjetoEditHeader({
  projetoId,
  nomeProjeto,
}: ProjetoEditHeaderProps) {
  const router = useRouter();
  const deleteProjeto = useDeleteSgpCadastro();
  const [excluirProjetoModal, setExcluirProjetoModal] = useState(false);

  const rbacReady = permissionsLoaded();
  const canDeleteProject = !rbacReady || hasPermission("edit-project");
  const showDeleteTooltip = rbacReady && !canDeleteProject;

  const nomeExibicao = nomeProjeto?.trim() || `projeto #${projetoId}`;

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
      <div className="flex shrink-0 flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TabsList
            className={cn(
              "flex h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-white py-1 text-muted-foreground",
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

        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 lg:w-[362px]">
          <Button
            type="button"
            variant="outline"
            className="flex-1 px-3"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Voltar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 px-3"
            onClick={handleEmBreve}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Clonar
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex-1 border-destructive/30 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setExcluirProjetoModal(true)}
                  disabled={deleteProjeto.isPending || !canDeleteProject}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Excluir
                </Button>
              </span>
            </TooltipTrigger>
            {showDeleteTooltip && (
              <TooltipContent>
                Você não possui permissão para excluir este projeto.
              </TooltipContent>
            )}
          </Tooltip>
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

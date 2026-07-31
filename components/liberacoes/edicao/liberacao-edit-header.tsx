"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Loader2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { FecharLiberacaoDialog } from "@/components/liberacoes/edicao/liberacao/fechar-liberacao-dialog";
import { useDeleteLiberacao } from "@/hooks/liberacoes/use-delete-liberacao";

const TAB_TRIGGER_CLASS = cn(
  "group shrink-0 rounded-full px-3 py-1.5 text-sm font-medium gap-1.5",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
);

const TABS = [
  { value: "liberacao", label: "Liberação" },
  { value: "casos-versao", label: "Casos da versão" },
] as const;

export interface LiberacaoEditHeaderProps {
  registro: number;
  status: string;
  formId?: string;
  isSaving?: boolean;
  showSalvar?: boolean;
}

export function LiberacaoEditHeader({
  registro,
  status,
  formId,
  isSaving = false,
  showSalvar = false,
}: LiberacaoEditHeaderProps) {
  const router = useRouter();
  const deleteLiberacao = useDeleteLiberacao();
  const [fecharModal, setFecharModal] = useState(false);
  const [excluirModal, setExcluirModal] = useState(false);
  const isFechada = status === "FECHADO";
  const isBusy = isSaving || deleteLiberacao.isPending;

  const handleExcluir = async () => {
    try {
      const response = await deleteLiberacao.mutateAsync(registro);
      toast.success(response.message ?? "Liberação excluída com sucesso.");
      router.push("/liberacoes");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir liberação.",
      );
    }
  };

  return (
    <>
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

        <div className="flex w-full shrink-0 flex-row items-center gap-1.5 lg:w-[420px]">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-0 flex-1 px-2"
            onClick={() => router.back()}
            disabled={isBusy}
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Voltar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-9 w-auto flex-1 border-destructive/30 bg-destructive/10 px-2 text-destructive hover:bg-destructive/20"
            onClick={() => setExcluirModal(true)}
            disabled={isBusy}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Excluir</span>
          </Button>

          {!isFechada && (
            <Button
              type="button"
              variant="outline"
              className="h-9 w-auto flex-1 border-emerald-500/30 bg-emerald-500/10 px-2 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
              onClick={() => setFecharModal(true)}
              disabled={isBusy}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Concluir liberação</span>
            </Button>
          )}

          {showSalvar ? (
            <Button
              type="submit"
              form={formId}
              disabled={isBusy || isFechada}
              className="h-9 min-w-0 flex-1 px-2"
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
          ) : null}
        </div>
      </div>

      <FecharLiberacaoDialog
        open={fecharModal}
        onOpenChange={setFecharModal}
        registro={registro}
      />

      <ConfirmacaoModal
        open={excluirModal}
        onOpenChange={setExcluirModal}
        titulo="Excluir liberação"
        descricao={`Tem certeza que deseja excluir a liberação #${registro}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluir}
        variant="danger"
        isLoading={deleteLiberacao.isPending}
      />
    </>
  );
}

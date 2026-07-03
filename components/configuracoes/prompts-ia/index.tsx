"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useFormAssistantPrompts } from "@/hooks/assistant/use-form-assistant-prompts";
import { useToggleFormAssistantPrompt } from "@/hooks/assistant/use-toggle-form-assistant-prompt";
import { useDeleteFormAssistantPrompt } from "@/hooks/assistant/use-delete-form-assistant-prompt";
import { PromptsIaTable } from "./prompts-ia-table";
import { PromptsIaSkeleton } from "./prompts-ia-skeleton";
import { PromptsIaDeleteDialog } from "./prompts-ia-delete-dialog";
import type { PromptRow } from "./types";

export function PromptsIa() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<PromptRow | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: prompts, isLoading } = useFormAssistantPrompts();

  const toggleMutation = useToggleFormAssistantPrompt();
  const deleteMutation = useDeleteFormAssistantPrompt();

  const filtered = useMemo(() => {
    const list = prompts ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.squadSetor?.toLowerCase().includes(q) ?? false),
    );
  }, [prompts, search]);

  function openDeleteDialog(row: PromptRow) {
    setPromptToDelete(row);
    setDeleteOpen(true);
  }

  function closeDeleteDialog() {
    setDeleteOpen(false);
    setPromptToDelete(null);
  }

  function handleToggle(row: PromptRow) {
    setTogglingId(row.id);
    toggleMutation.mutate(row.id, {
      onSuccess: () => {
        toast.success(row.isActive ? "Prompt desativado." : "Prompt ativado.");
      },
      onError: (err) => {
        toast.error(err.message || "Erro ao alternar status do prompt.");
      },
      onSettled: () => {
        setTogglingId(null);
      },
    });
  }

  function handleDelete() {
    if (!promptToDelete) return;
    deleteMutation.mutate(promptToDelete.id, {
      onSuccess: () => {
        toast.success("Prompt excluído com sucesso.");
        closeDeleteDialog();
      },
      onError: (err) => {
        toast.error(err.message || "Erro ao excluir prompt.");
      },
    });
  }

  return (
    <>
      <ListagemPageLayout
        title="Prompts IA"
        subtitle="Gerencie os prompts do assistente de abertura de caso"
        actions={
          <>
            <Button
              onClick={() => router.push("/configuracoes/prompts-ia/novo")}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Novo Prompt
            </Button>
          </>
        }
      >
        <CadastroFiltrosCard
          fieldLabel="Buscar"
          placeholder="Nome ou squad..."
          value={search}
          onChange={setSearch}
          inputAriaLabel="Buscar prompt"
        />

        <CadastroListagemCard
          title="Listagem de Prompts"
          icon={Sparkles}
          showTotalRecords
          totalRecords={filtered.length}
          totalRecordsUnit={{ singular: "prompt", plural: "prompts" }}
        >
          {isLoading ? (
            <PromptsIaSkeleton />
          ) : (
            <PromptsIaTable
              rows={filtered}
              togglingId={togglingId}
              onToggle={handleToggle}
              onDelete={openDeleteDialog}
            />
          )}
        </CadastroListagemCard>
      </ListagemPageLayout>

      <PromptsIaDeleteDialog
        open={deleteOpen}
        prompt={promptToDelete}
        isPending={deleteMutation.isPending}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}

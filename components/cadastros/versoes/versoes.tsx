"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FilterX, GitBranch, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { Button } from "@/components/ui/button";
import type { VersionRow } from "@/components/cadastros/types";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { useDeleteVersion, useVersionById } from "@/hooks/use-create-version";
import { useDbCadastroList } from "@/hooks/use-db-cadastro-list";
import { listVersionsClient } from "@/services/db-api/list-cadastros";
import { VersoesModalNovo } from "./versoes-modal-novo";
import { VersoesTabela } from "./versoes-tabela";
import { VersoesTabelaSkeleton } from "./versoes-tabela-skeleton";

interface VersoesProps {
  initialSearch: string;
}

export function Versoes({ initialSearch }: VersoesProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingVersion, setEditingVersion] = useState<VersionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VersionRow | null>(null);
  const deleteVersionMutation = useDeleteVersion();
  const getVersionByIdMutation = useVersionById();

  const {
    searchInput,
    setSearchInput,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = useDbCadastroList<VersionRow>({
    queryKeyPrefix: "db-versions",
    initialSearch,
    fetcher: (s) => listVersionsClient(s),
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const temBuscaAtiva =
    searchInput.trim().length > 0 || initialSearch.trim().length > 0;

  const openCreateModal = () => {
    setModalMode("create");
    setEditingVersion(null);
    setModalOpen(true);
  };

  const openEditModal = async (row: VersionRow) => {
    try {
      const full = await getVersionByIdMutation.mutateAsync(row.id);
      setEditingVersion(full);
      setModalMode("edit");
      setModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar versão";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVersionMutation.mutateAsync(deleteTarget.id);
      toast.success("Versão excluída.");
      await queryClient.invalidateQueries({ queryKey: ["db-versions"] });
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir versão";
      toast.error(message);
    }
  };

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Versões</h1>
          <p className="text-sm text-text-secondary">
            Cadastro base de versões de produto
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            disabled={!temBuscaAtiva}
            onClick={() => setSearchInput("")}
          >
            <FilterX className="h-3.5 w-3.5" />
            Limpar busca
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={openCreateModal}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo cadastro
          </Button>
        </div>
      </div>

      <CadastroFiltrosCard
        fieldLabel="Nome ou ID"
        placeholder="Buscar por nome ou ID..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar versões"
      />

      <CadastroListagemCard title="Listagem de Versões" icon={GitBranch}>
        {showTableSkeleton ? (
          <VersoesTabelaSkeleton />
        ) : (
          <VersoesTabela
            rows={rows}
            onEdit={openEditModal}
            onDelete={(row) => setDeleteTarget(row)}
          />
        )}
      </CadastroListagemCard>

      <VersoesModalNovo
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={
          modalMode === "edit" && editingVersion
            ? { id: editingVersion.id, name: editingVersion.name ?? "" }
            : null
        }
      />

      <ConfirmacaoModal
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        titulo="Excluir versão?"
        descricao={`Essa ação removerá a versão "${deleteTarget?.name?.trim() || "sem nome"}" e não poderá ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        variant="danger"
        isLoading={deleteVersionMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

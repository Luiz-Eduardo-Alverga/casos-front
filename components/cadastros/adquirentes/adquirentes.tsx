"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, FilterX, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { Button } from "@/components/ui/button";
import type { AcquirerListExpandedItem } from "@/components/cadastros/types";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { useDeleteAcquirer } from "@/hooks/use-create-acquirer";
import { useAcquirerDetailQuery } from "@/hooks/use-db-cadastro-detail";
import { AdquirentesModalNovo } from "./adquirentes-modal-novo";
import {
  hasAdquirentesFiltrosAtivos,
  useAdquirentesList,
} from "./adquirentes-shared";
import { AdquirentesTabela } from "./adquirentes-tabela";
import { AdquirentesTabelaSkeleton } from "./adquirentes-tabela-skeleton";

interface AdquirentesProps {
  initialSearch: string;
  initialStatus: string;
}

export function Adquirentes({
  initialSearch,
  initialStatus,
}: AdquirentesProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingAcquirerId, setEditingAcquirerId] = useState<string | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<AcquirerListExpandedItem | null>(null);
  const deleteAcquirerMutation = useDeleteAcquirer();

  const editDetailEnabled = modalOpen && modalMode === "edit";
  const acquirerDetailQuery = useAcquirerDetailQuery(
    editingAcquirerId,
    editDetailEnabled,
  );

  const {
    searchInput,
    setSearchInput,
    statusFilter,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = useAdquirentesList(initialSearch, initialStatus);

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (
      !modalOpen ||
      modalMode !== "edit" ||
      !editingAcquirerId ||
      !acquirerDetailQuery.isError ||
      !acquirerDetailQuery.error
    ) {
      return;
    }
    toast.error(acquirerDetailQuery.error.message);
    queryClient.removeQueries({
      queryKey: ["db-acquirer", editingAcquirerId],
    });
    setModalOpen(false);
    setEditingAcquirerId(null);
  }, [
    modalOpen,
    modalMode,
    editingAcquirerId,
    acquirerDetailQuery.isError,
    acquirerDetailQuery.error,
    queryClient,
  ]);

  const temBuscaAtiva = hasAdquirentesFiltrosAtivos({
    searchInput,
    initialSearch,
    statusValue: statusFilter?.value,
    initialStatus,
  });

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingAcquirerId(null);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingAcquirerId(null);
    setModalOpen(true);
  };

  const openEditModal = (row: AcquirerListExpandedItem) => {
    setModalMode("edit");
    setEditingAcquirerId(row.acquirer.id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAcquirerMutation.mutateAsync(deleteTarget.acquirer.id);
      toast.success("Adquirente excluído.");
      await queryClient.invalidateQueries({ queryKey: ["db-acquirers"] });
      queryClient.removeQueries({
        queryKey: ["db-acquirer", deleteTarget.acquirer.id],
      });
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir adquirente";
      toast.error(message);
    }
  };

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Adquirentes</h1>
          <p className="text-sm text-text-secondary">
            Cadastro base de adquirentes utilizados nos casos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            disabled={!temBuscaAtiva}
            onClick={() => {
              setSearchInput("");
              statusFilter?.setValue("");
            }}
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
        fieldLabel="Nome"
        placeholder="Buscar por nome..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar adquirentes"
        statusSelect={
          statusFilter
            ? {
                value: statusFilter.value,
                onChange: statusFilter.setValue,
              }
            : undefined
        }
      />

      <CadastroListagemCard title="Listagem de Adquirentes" icon={Building2}>
        {showTableSkeleton ? (
          <AdquirentesTabelaSkeleton />
        ) : (
          <AdquirentesTabela
            rows={rows}
            onEdit={openEditModal}
            onDelete={(row) => setDeleteTarget(row)}
          />
        )}
      </CadastroListagemCard>

      <AdquirentesModalNovo
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        mode={modalMode}
        isLoadingEdit={
          modalMode === "edit" &&
          Boolean(editingAcquirerId) &&
          acquirerDetailQuery.isLoading
        }
        initialData={
          modalMode === "edit" && acquirerDetailQuery.data
            ? {
                id: acquirerDetailQuery.data.id,
                name: acquirerDetailQuery.data.name,
                logoUrl: acquirerDetailQuery.data.logoUrl,
                has4g: acquirerDetailQuery.data.has4g ?? false,
              }
            : null
        }
      />

      <ConfirmacaoModal
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        titulo="Excluir adquirente?"
        descricao={`Essa ação removerá a adquirente "${deleteTarget?.acquirer.name ?? ""}" e não poderá ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        variant="danger"
        isLoading={deleteAcquirerMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

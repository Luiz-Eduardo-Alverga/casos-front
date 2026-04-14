"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FilterX, Plus, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { Button } from "@/components/ui/button";
import type { DeviceRow } from "@/components/cadastros/types";
import { CadastroFiltrosCard } from "@/components/cadastros/cadastro-filtros-card";
import { CadastroListagemCard } from "@/components/cadastros/cadastro-listagem-card";
import { useDeleteDevice } from "@/hooks/use-create-device";
import { useDeviceDetailQuery } from "@/hooks/use-db-cadastro-detail";
import { useDbCadastroList } from "@/hooks/use-db-cadastro-list";
import { listDevicesClient } from "@/services/db-api/list-cadastros";
import { DispositivosModalNovo } from "./dispositivos-modal-novo";
import { DispositivosTabela } from "./dispositivos-tabela";
import { DispositivosTabelaSkeleton } from "./dispositivos-tabela-skeleton";

interface DispositivosProps {
  initialSearch: string;
}

export function Dispositivos({ initialSearch }: DispositivosProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeviceRow | null>(null);
  const deleteDeviceMutation = useDeleteDevice();

  const editDetailEnabled = modalOpen && modalMode === "edit";
  const deviceDetailQuery = useDeviceDetailQuery(
    editingDeviceId,
    editDetailEnabled,
  );

  const {
    searchInput,
    setSearchInput,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = useDbCadastroList<DeviceRow>({
    queryKeyPrefix: "db-devices",
    initialSearch,
    fetcher: (s) => listDevicesClient(s),
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  useEffect(() => {
    if (
      !modalOpen ||
      modalMode !== "edit" ||
      !editingDeviceId ||
      !deviceDetailQuery.isError ||
      !deviceDetailQuery.error
    ) {
      return;
    }
    toast.error(deviceDetailQuery.error.message);
    queryClient.removeQueries({
      queryKey: ["db-device", editingDeviceId],
    });
    setModalOpen(false);
    setEditingDeviceId(null);
  }, [
    modalOpen,
    modalMode,
    editingDeviceId,
    deviceDetailQuery.isError,
    deviceDetailQuery.error,
    queryClient,
  ]);

  const temBuscaAtiva =
    searchInput.trim().length > 0 || initialSearch.trim().length > 0;

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingDeviceId(null);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingDeviceId(null);
    setModalOpen(true);
  };

  const openEditModal = (row: DeviceRow) => {
    setModalMode("edit");
    setEditingDeviceId(row.id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDeviceMutation.mutateAsync(deleteTarget.id);
      toast.success("Dispositivo excluído.");
      await queryClient.invalidateQueries({ queryKey: ["db-devices"] });
      queryClient.removeQueries({
        queryKey: ["db-device", deleteTarget.id],
      });
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir dispositivo";
      toast.error(message);
    }
  };

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Dispositivos</h1>
          <p className="text-sm text-text-secondary">
            Cadastro base de dispositivos compatíveis
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
        fieldLabel="Nome"
        placeholder="Buscar por nome..."
        value={searchInput}
        onChange={setSearchInput}
        inputAriaLabel="Buscar dispositivos"
      />

      <CadastroListagemCard title="Listagem de Dispositivos" icon={Smartphone}>
        {showTableSkeleton ? (
          <DispositivosTabelaSkeleton />
        ) : (
          <DispositivosTabela
            rows={rows}
            onEdit={openEditModal}
            onDelete={(row) => setDeleteTarget(row)}
          />
        )}
      </CadastroListagemCard>

      <DispositivosModalNovo
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        mode={modalMode}
        isLoadingEdit={
          modalMode === "edit" &&
          Boolean(editingDeviceId) &&
          deviceDetailQuery.isLoading
        }
        initialData={
          modalMode === "edit" && deviceDetailQuery.data
            ? {
                id: deviceDetailQuery.data.id,
                name: deviceDetailQuery.data.name,
              }
            : null
        }
      />

      <ConfirmacaoModal
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        titulo="Excluir dispositivo?"
        descricao={`Essa ação removerá o dispositivo "${deleteTarget?.name ?? ""}" e não poderá ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        variant="danger"
        isLoading={deleteDeviceMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

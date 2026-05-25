"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDeleteSgpRisco } from "@/hooks/projetos/use-delete-sgp-risco";
import { useDeleteSgpRiscoHistorico } from "@/hooks/projetos/use-delete-sgp-risco-historico";
import { useSgpRiscosByProjetoInfinite } from "@/hooks/projetos/use-sgp-riscos-by-projeto";
import { useSgpRiscosHistoricoByRiscoInfinite } from "@/hooks/projetos/use-sgp-riscos-historico-by-risco";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import type { SgpRiscoHistoricoItem } from "@/interfaces/sgp-risco-historico";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { AbaRiscoSkeleton } from "@/components/projetos/edicao/risco/aba-risco-skeleton";
import { RiscosIdentificadosCard } from "@/components/projetos/edicao/risco/riscos-identificados-card";
import { RiscosOcorrenciasCard } from "@/components/projetos/edicao/risco/riscos-ocorrencias-card";
import { RiscoFormModal } from "@/components/projetos/edicao/risco/risco-form-modal";
import { RiscoHistoricoFormModal } from "@/components/projetos/edicao/risco/risco-historico-form-modal";

const PER_PAGE = 15;

export interface AbaRiscoProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaRisco({ projetoId, enabled = true }: AbaRiscoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [riscoEmEdicao, setRiscoEmEdicao] = useState<SgpRiscoItem | null>(null);
  const [riscoSelecionado, setRiscoSelecionado] = useState<SgpRiscoItem | null>(
    null,
  );
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    risco: SgpRiscoItem | null;
  }>({ open: false, risco: null });
  const [ocorrenciaModal, setOcorrenciaModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    ocorrencia: SgpRiscoHistoricoItem | null;
  }>({ open: false, mode: "create", ocorrencia: null });
  const [excluirOcorrenciaModal, setExcluirOcorrenciaModal] = useState<{
    open: boolean;
    ocorrencia: SgpRiscoHistoricoItem | null;
  }>({ open: false, ocorrencia: null });

  const deleteRisco = useDeleteSgpRisco({ projetoId });
  const deleteOcorrencia = useDeleteSgpRiscoHistorico();

  const riscosQuery = useSgpRiscosByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const historicoQuery = useSgpRiscosHistoricoByRiscoInfinite(
    riscoSelecionado?.sequencia,
    {
      enabled: enabled && !!riscoSelecionado,
      per_page: PER_PAGE,
    },
  );

  const riscos = useMemo(
    () => riscosQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [riscosQuery.data?.pages],
  );

  const historico = useMemo(
    () => historicoQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [historicoQuery.data?.pages],
  );

  const isInitialLoading =
    enabled && riscosQuery.isLoading && !riscosQuery.data;

  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  const handleSelecionarRisco = useCallback((item: SgpRiscoItem) => {
    setRiscoSelecionado(item);
  }, []);

  const handleAdicionarRisco = useCallback(() => {
    setModalMode("create");
    setRiscoEmEdicao(null);
    setModalOpen(true);
  }, []);

  const handleEditarRisco = useCallback((item: SgpRiscoItem) => {
    setModalMode("edit");
    setRiscoEmEdicao(item);
    setModalOpen(true);
  }, []);

  const handleExcluirRisco = useCallback((item: SgpRiscoItem) => {
    setExcluirModal({ open: true, risco: item });
  }, []);

  const handleExcluirConfirm = useCallback(async () => {
    const sequencia = excluirModal.risco?.sequencia;
    if (!sequencia) return;

    try {
      const response = await deleteRisco.mutateAsync(sequencia);
      toast.success(response.message ?? "Risco excluído com sucesso.");
      if (riscoSelecionado?.sequencia === sequencia) {
        setRiscoSelecionado(null);
      }
      setExcluirModal({ open: false, risco: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir risco.",
      );
      throw error;
    }
  }, [deleteRisco, excluirModal.risco?.sequencia, riscoSelecionado?.sequencia]);

  const handleAdicionarOcorrencia = useCallback(() => {
    if (!riscoSelecionado) {
      toast.error("Selecione um risco acima para adicionar uma ocorrência.");
      return;
    }
    setOcorrenciaModal({ open: true, mode: "create", ocorrencia: null });
  }, [riscoSelecionado]);

  const handleEditarOcorrencia = useCallback((item: SgpRiscoHistoricoItem) => {
    setOcorrenciaModal({ open: true, mode: "edit", ocorrencia: item });
  }, []);

  const handleExcluirOcorrencia = useCallback((item: SgpRiscoHistoricoItem) => {
    setExcluirOcorrenciaModal({ open: true, ocorrencia: item });
  }, []);

  const handleExcluirOcorrenciaConfirm = useCallback(async () => {
    const ocorrencia = excluirOcorrenciaModal.ocorrencia;
    if (!ocorrencia?.id) return;

    try {
      const response = await deleteOcorrencia.mutateAsync({
        id: ocorrencia.id,
        id_seq: ocorrencia.id_seq,
      });
      toast.success(response.message ?? "Ocorrência excluída com sucesso.");
      setExcluirOcorrenciaModal({ open: false, ocorrencia: null });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao excluir ocorrência.",
      );
      throw error;
    }
  }, [deleteOcorrencia, excluirOcorrenciaModal.ocorrencia]);

  const nomeRiscoExcluir =
    excluirModal.risco?.descricao_risco?.trim() || "este risco";

  const descricaoOcorrenciaExcluir =
    excluirOcorrenciaModal.ocorrencia?.descricao?.trim() || "esta ocorrência";

  if (isInitialLoading) {
    return <AbaRiscoSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <RiscosIdentificadosCard
        riscos={riscos}
        riscoSelecionadoId={riscoSelecionado?.sequencia ?? null}
        isError={riscosQuery.isError}
        errorMessage={
          riscosQuery.error instanceof Error
            ? riscosQuery.error.message
            : undefined
        }
        hasNextPage={riscosQuery.hasNextPage ?? false}
        isFetchingNextPage={riscosQuery.isFetchingNextPage}
        onLoadMore={() => riscosQuery.fetchNextPage()}
        onSelecionar={handleSelecionarRisco}
        onAdicionar={canEdit ? handleAdicionarRisco : undefined}
        onEditar={canEdit ? handleEditarRisco : undefined}
        onExcluir={canEdit ? handleExcluirRisco : undefined}
      />
      <RiscosOcorrenciasCard
        itens={historico}
        semRiscoSelecionado={!riscoSelecionado}
        isLoading={historicoQuery.isLoading && !!riscoSelecionado}
        isError={historicoQuery.isError}
        errorMessage={
          historicoQuery.error instanceof Error
            ? historicoQuery.error.message
            : undefined
        }
        hasNextPage={historicoQuery.hasNextPage ?? false}
        isFetchingNextPage={historicoQuery.isFetchingNextPage}
        onLoadMore={() => historicoQuery.fetchNextPage()}
        onAdicionar={canEdit ? handleAdicionarOcorrencia : undefined}
        onEditar={canEdit ? handleEditarOcorrencia : undefined}
        onExcluir={canEdit ? handleExcluirOcorrencia : undefined}
      />

      <RiscoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        projetoId={projetoId}
        risco={riscoEmEdicao}
      />

      <RiscoHistoricoFormModal
        open={ocorrenciaModal.open}
        onOpenChange={(open) =>
          setOcorrenciaModal((prev) => ({
            ...prev,
            open,
            ocorrencia: open ? prev.ocorrencia : null,
          }))
        }
        mode={ocorrenciaModal.mode}
        riscos={riscos}
        riscoPadrao={ocorrenciaModal.mode === "create" ? riscoSelecionado : null}
        ocorrencia={ocorrenciaModal.ocorrencia}
      />

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) => {
          if (!open) setExcluirModal({ open: false, risco: null });
        }}
        titulo="Excluir risco"
        descricao={`Tem certeza que deseja excluir ${nomeRiscoExcluir}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={deleteRisco.isPending}
      />

      <ConfirmacaoModal
        open={excluirOcorrenciaModal.open}
        onOpenChange={(open) => {
          if (!open) setExcluirOcorrenciaModal({ open: false, ocorrencia: null });
        }}
        titulo="Excluir ocorrência"
        descricao={`Tem certeza que deseja excluir ${descricaoOcorrenciaExcluir}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirOcorrenciaConfirm}
        variant="danger"
        isLoading={deleteOcorrencia.isPending}
      />
    </div>
  );
}

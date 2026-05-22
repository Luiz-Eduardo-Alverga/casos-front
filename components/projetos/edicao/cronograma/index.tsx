"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSgpTipos } from "@/hooks/catalogos/use-sgp-tipos";
import { useSgpCronogramaByProjetoInfinite } from "@/hooks/projetos/use-sgp-cronograma-by-projeto";
import { useDeleteSgpCronograma } from "@/hooks/projetos/use-delete-sgp-cronograma";
import {
  buildSgpTiposMap,
  buildSgpTiposMetaMap,
} from "@/components/projetos/edicao/shared/sgp-tipos-utils";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { AbaCronogramaSkeleton } from "@/components/projetos/edicao/cronograma/aba-cronograma-skeleton";
import { CronogramaCard } from "@/components/projetos/edicao/cronograma/cronograma-card";
import { CronogramaFormModal } from "@/components/projetos/edicao/cronograma/cronograma-form-modal";
import { CronogramaConcluirModal } from "@/components/projetos/edicao/cronograma/cronograma-concluir-modal";
import {
  resolveCronogramaOrdemNumero,
  resolveCronogramaTitulo,
} from "@/components/projetos/edicao/cronograma/utils";

const PER_PAGE = 15;

export interface AbaCronogramaProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaCronograma({
  projetoId,
  enabled = true,
}: AbaCronogramaProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [tarefaEmEdicao, setTarefaEmEdicao] =
    useState<SgpCronogramaItem | null>(null);
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    tarefa: SgpCronogramaItem | null;
  }>({ open: false, tarefa: null });
  const [concluirModal, setConcluirModal] = useState<{
    open: boolean;
    tarefa: SgpCronogramaItem | null;
  }>({ open: false, tarefa: null });

  const deleteCronograma = useDeleteSgpCronograma({ projetoId });

  const cronogramaQuery = useSgpCronogramaByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const tiposQuery = useSgpTipos({ enabled });

  const tiposMap = useMemo(
    () => buildSgpTiposMap(tiposQuery.data?.data ?? []),
    [tiposQuery.data?.data],
  );

  const tiposMetaMap = useMemo(
    () => buildSgpTiposMetaMap(tiposQuery.data?.data ?? []),
    [tiposQuery.data?.data],
  );

  const tarefas = useMemo(() => {
    const items = cronogramaQuery.data?.pages.flatMap((p) => p.data) ?? [];
    return [...items].sort(
      (a, b) =>
        resolveCronogramaOrdemNumero(a.id_tipo, tiposMetaMap) -
        resolveCronogramaOrdemNumero(b.id_tipo, tiposMetaMap),
    );
  }, [cronogramaQuery.data?.pages, tiposMetaMap]);

  const isInitialLoading =
    enabled && cronogramaQuery.isLoading && !cronogramaQuery.data;

  const abrirCriar = () => {
    setModalMode("create");
    setTarefaEmEdicao(null);
    setModalOpen(true);
  };

  const abrirEditar = (tarefa: SgpCronogramaItem) => {
    setModalMode("edit");
    setTarefaEmEdicao(tarefa);
    setModalOpen(true);
  };

  const abrirExcluir = (tarefa: SgpCronogramaItem) => {
    setExcluirModal({ open: true, tarefa });
  };

  const abrirConcluir = (tarefa: SgpCronogramaItem) => {
    setConcluirModal({ open: true, tarefa });
  };

  const handleExcluirConfirm = async () => {
    const sequencia = excluirModal.tarefa?.sequencia;
    if (!sequencia) return;

    try {
      const response = await deleteCronograma.mutateAsync(sequencia);
      toast.success(
        response.message ?? "Tarefa excluída do cronograma com sucesso.",
      );
      setExcluirModal({ open: false, tarefa: null });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao excluir tarefa do cronograma.",
      );
      throw error;
    }
  };

  const nomeTarefaExcluir =
    excluirModal.tarefa != null
      ? resolveCronogramaTitulo(excluirModal.tarefa.id_tipo, tiposMetaMap)
      : "esta tarefa";

  if (isInitialLoading) {
    return <AbaCronogramaSkeleton />;
  }

  return (
    <>
      <CronogramaCard
        tarefas={tarefas}
        tiposMap={tiposMap}
        tiposMetaMap={tiposMetaMap}
        isLoading={cronogramaQuery.isLoading}
        isError={cronogramaQuery.isError}
        errorMessage={
          cronogramaQuery.error instanceof Error
            ? cronogramaQuery.error.message
            : undefined
        }
        hasNextPage={cronogramaQuery.hasNextPage ?? false}
        isFetchingNextPage={cronogramaQuery.isFetchingNextPage}
        onLoadMore={() => cronogramaQuery.fetchNextPage()}
        onAdicionar={abrirCriar}
        onEditar={abrirEditar}
        onExcluir={abrirExcluir}
        onConcluir={abrirConcluir}
      />

      <CronogramaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        projetoId={projetoId}
        tarefa={tarefaEmEdicao}
      />

      <CronogramaConcluirModal
        open={concluirModal.open}
        onOpenChange={(open) => {
          if (!open) setConcluirModal({ open: false, tarefa: null });
        }}
        projetoId={projetoId}
        tarefa={concluirModal.tarefa}
      />

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) => {
          if (!open) setExcluirModal({ open: false, tarefa: null });
        }}
        titulo="Excluir tarefa"
        descricao={`Tem certeza que deseja excluir ${nomeTarefaExcluir}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={deleteCronograma.isPending}
      />
    </>
  );
}

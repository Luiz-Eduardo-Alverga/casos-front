"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSgpTipos } from "@/hooks/catalogos/use-sgp-tipos";
import { useSgpStakesByProjetoInfinite } from "@/hooks/projetos/use-sgp-stakes-by-projeto";
import { useSgpUsuariosByProjetoInfinite } from "@/hooks/projetos/use-sgp-usuarios-by-projeto";
import { useDeleteSgpStake } from "@/hooks/projetos/use-delete-sgp-stake";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { buildSgpTiposMap } from "@/components/projetos/edicao/stakes/utils";
import { AbaStakesSkeleton } from "@/components/projetos/edicao/stakes/aba-stakes-skeleton";
import { StakesCard } from "@/components/projetos/edicao/stakes/stakes-card";
import { StakeFormModal } from "@/components/projetos/edicao/stakes/stake-form-modal";
import { UsuariosAutorizadosCard } from "@/components/projetos/edicao/stakes/usuarios-autorizados-card";

const PER_PAGE = 15;

export interface AbaStakesProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaStakes({ projetoId, enabled = true }: AbaStakesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [stakeEmEdicao, setStakeEmEdicao] = useState<SgpStakeItem | null>(null);
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    stake: SgpStakeItem | null;
  }>({ open: false, stake: null });

  const deleteStake = useDeleteSgpStake({ projetoId });

  const stakesQuery = useSgpStakesByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const usuariosQuery = useSgpUsuariosByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const tiposQuery = useSgpTipos({ enabled });

  const tiposMap = useMemo(
    () => buildSgpTiposMap(tiposQuery.data?.data ?? []),
    [tiposQuery.data?.data],
  );

  const stakes = useMemo(
    () => stakesQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [stakesQuery.data?.pages],
  );

  const usuarios = useMemo(
    () => usuariosQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [usuariosQuery.data?.pages],
  );

  const isInitialLoading =
    enabled &&
    ((stakesQuery.isLoading && !stakesQuery.data) ||
      (usuariosQuery.isLoading && !usuariosQuery.data));

  const abrirCriar = () => {
    setModalMode("create");
    setStakeEmEdicao(null);
    setModalOpen(true);
  };

  const abrirEditar = (stake: SgpStakeItem) => {
    setModalMode("edit");
    setStakeEmEdicao(stake);
    setModalOpen(true);
  };

  const abrirExcluir = (stake: SgpStakeItem) => {
    setExcluirModal({ open: true, stake });
  };

  const handleExcluirConfirm = async () => {
    const sequencia = excluirModal.stake?.sequencia;
    if (!sequencia) return;

    try {
      const response = await deleteStake.mutateAsync(sequencia);
      toast.success(response.message ?? "Stake excluído com sucesso.");
      setExcluirModal({ open: false, stake: null });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao excluir stakeholder.",
      );
      throw error;
    }
  };

  const nomeStakeExcluir = excluirModal.stake?.nomes?.trim() || "este stakeholder";

  if (isInitialLoading) {
    return <AbaStakesSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <StakesCard
        stakes={stakes}
        tiposMap={tiposMap}
        isLoading={stakesQuery.isLoading}
        isError={stakesQuery.isError}
        errorMessage={
          stakesQuery.error instanceof Error
            ? stakesQuery.error.message
            : undefined
        }
        hasNextPage={stakesQuery.hasNextPage ?? false}
        isFetchingNextPage={stakesQuery.isFetchingNextPage}
        onLoadMore={() => stakesQuery.fetchNextPage()}
        onAdicionar={abrirCriar}
        onEditar={abrirEditar}
        onExcluir={abrirExcluir}
      />
      <UsuariosAutorizadosCard
        usuarios={usuarios}
        isLoading={usuariosQuery.isLoading}
        isError={usuariosQuery.isError}
        errorMessage={
          usuariosQuery.error instanceof Error
            ? usuariosQuery.error.message
            : undefined
        }
        hasNextPage={usuariosQuery.hasNextPage ?? false}
        isFetchingNextPage={usuariosQuery.isFetchingNextPage}
        onLoadMore={() => usuariosQuery.fetchNextPage()}
      />

      <StakeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        projetoId={projetoId}
        stake={stakeEmEdicao}
      />

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) => {
          if (!open) setExcluirModal({ open: false, stake: null });
        }}
        titulo="Excluir stakeholder"
        descricao={`Tem certeza que deseja excluir ${nomeStakeExcluir}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={deleteStake.isPending}
      />
    </div>
  );
}

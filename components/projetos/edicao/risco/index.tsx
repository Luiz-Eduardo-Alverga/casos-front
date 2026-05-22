"use client";

import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useSgpRiscosByProjetoInfinite } from "@/hooks/projetos/use-sgp-riscos-by-projeto";
import { useSgpRiscosHistoricoByProjetoInfinite } from "@/hooks/projetos/use-sgp-riscos-historico-by-projeto";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import type { SgpRiscoHistoricoItem } from "@/interfaces/sgp-risco-historico";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { AbaRiscoSkeleton } from "@/components/projetos/edicao/risco/aba-risco-skeleton";
import { RiscosIdentificadosCard } from "@/components/projetos/edicao/risco/riscos-identificados-card";
import { RiscosOcorrenciasCard } from "@/components/projetos/edicao/risco/riscos-ocorrencias-card";

const PER_PAGE = 15;
const EM_BREVE_MSG = "Funcionalidade disponível em breve.";

export interface AbaRiscoProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaRisco({ projetoId, enabled = true }: AbaRiscoProps) {
  const riscosQuery = useSgpRiscosByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const historicoQuery = useSgpRiscosHistoricoByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE,
  });

  const riscos = useMemo(
    () => riscosQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [riscosQuery.data?.pages],
  );

  const historico = useMemo(
    () => historicoQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [historicoQuery.data?.pages],
  );

  const isInitialLoading =
    enabled &&
    ((riscosQuery.isLoading && !riscosQuery.data) ||
      (historicoQuery.isLoading && !historicoQuery.data));

  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  const handleEmBreve = useCallback(() => {
    if (!canEdit) return;
    toast(EM_BREVE_MSG);
  }, [canEdit]);

  const handleAdicionarRisco = useCallback(() => {
    handleEmBreve();
  }, [handleEmBreve]);

  const handleEditarRisco = useCallback(
    (_item: SgpRiscoItem) => {
      handleEmBreve();
    },
    [handleEmBreve],
  );

  const handleExcluirRisco = useCallback(
    (_item: SgpRiscoItem) => {
      handleEmBreve();
    },
    [handleEmBreve],
  );

  const handleAdicionarOcorrencia = useCallback(() => {
    handleEmBreve();
  }, [handleEmBreve]);

  const handleEditarOcorrencia = useCallback(
    (_item: SgpRiscoHistoricoItem) => {
      handleEmBreve();
    },
    [handleEmBreve],
  );

  const handleExcluirOcorrencia = useCallback(
    (_item: SgpRiscoHistoricoItem) => {
      handleEmBreve();
    },
    [handleEmBreve],
  );

  if (isInitialLoading) {
    return <AbaRiscoSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <RiscosIdentificadosCard
        riscos={riscos}
        isError={riscosQuery.isError}
        errorMessage={
          riscosQuery.error instanceof Error
            ? riscosQuery.error.message
            : undefined
        }
        hasNextPage={riscosQuery.hasNextPage ?? false}
        isFetchingNextPage={riscosQuery.isFetchingNextPage}
        onLoadMore={() => riscosQuery.fetchNextPage()}
        onAdicionar={canEdit ? handleAdicionarRisco : undefined}
        onEditar={canEdit ? handleEditarRisco : undefined}
        onExcluir={canEdit ? handleExcluirRisco : undefined}
      />
      <RiscosOcorrenciasCard
        itens={historico}
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
    </div>
  );
}

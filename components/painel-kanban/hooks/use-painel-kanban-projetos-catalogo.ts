"use client";

import { useMemo } from "react";
import { useProjetos } from "@/hooks/catalogos/use-projetos";
import type { PainelKanbanApiFiltros } from "@/components/painel-kanban/filtros/build-kanban-filtros-state";

export function usePainelKanbanProjetosCatalogo(
  apiFiltros: PainelKanbanApiFiltros | null,
  hydrated: boolean,
) {
  const usuarioIdNumber = useMemo(() => {
    if (!apiFiltros?.devAtribuidoId.trim()) return undefined;
    const n = Number(apiFiltros.devAtribuidoId);
    return Number.isFinite(n) ? n : undefined;
  }, [apiFiltros?.devAtribuidoId]);

  const { data: projetos, isLoading: isProjetosLoading } = useProjetos({
    usuario_id: usuarioIdNumber,
    requireSetorProjeto: false,
    enabled: hydrated && Boolean(usuarioIdNumber),
  });

  return { projetos, isProjetosLoading };
}

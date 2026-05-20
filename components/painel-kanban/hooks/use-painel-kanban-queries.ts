"use client";

import { useEffect, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useAgendaDev } from "@/hooks/painel/use-agenda-dev";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { PAINEL_PRODUTO_ORDEM_KEY } from "@/lib/auth";
import { parseAgendaDevCount } from "@/services/auxiliar/get-agenda-dev";
import type { AgendaDevItem } from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import type { PainelKanbanApiFiltros } from "@/components/painel-kanban/filtros/build-kanban-filtros-state";
import {
  dedupePainelKanbanItemsById,
  mapProjetoMemoriaItemToKanban,
  sortAbertosIniciadosPrimeiro,
  type PainelKanbanItem,
} from "@/components/painel-kanban/kanban/painel-kanban-map";
import type { PainelKanbanColumnId } from "@/components/painel-kanban/kanban/painel-kanban-columns";

function hasValidAgendaSelection(
  agendaItems: AgendaDevItem[] | undefined,
  produto: string,
  versao: string,
): boolean {
  if (!agendaItems?.length || !produto.trim() || !versao.trim()) return false;
  return agendaItems.some(
    (a) =>
      String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
  );
}

interface UsePainelKanbanQueriesParams {
  apiFiltros: PainelKanbanApiFiltros | null;
  hydrated: boolean;
  produto: string;
  versao: string;
  methods: UseFormReturn<PainelKanbanFiltrosForm>;
}

export function usePainelKanbanQueries({
  apiFiltros,
  hydrated,
  produto,
  versao,
  methods,
}: UsePainelKanbanQueriesParams) {
  const { setValue } = methods;
  const agendaInitRef = useRef(false);
  const hasAgendaLoadedOnceRef = useRef(false);

  const agendaQuery = useAgendaDev(
    {
      id_colaborador: apiFiltros?.devAtribuidoId ?? "",
      Cronograma_id: apiFiltros?.cronogramaId,
    },
    {
      enabled: hydrated && Boolean(apiFiltros?.devAtribuidoId),
    },
  );

  const agendaDevData = agendaQuery.data;
  const isAgendaLoading = agendaQuery.isLoading;
  const isAgendaFetching = agendaQuery.isFetching;

  useEffect(() => {
    if (agendaDevData != null) {
      hasAgendaLoadedOnceRef.current = true;
    }
  }, [agendaDevData]);

  const showKanbanSkeleton =
    hydrated &&
    Boolean(apiFiltros?.devAtribuidoId) &&
    isAgendaLoading &&
    !hasAgendaLoadedOnceRef.current;

  useEffect(() => {
    if (!apiFiltros?.devAtribuidoId) return;
    agendaInitRef.current = false;
  }, [apiFiltros?.devAtribuidoId, apiFiltros?.cronogramaId]);

  useEffect(() => {
    if (!hydrated || !agendaDevData?.length || agendaInitRef.current) return;

    const currentProduto = methods.getValues("produto")?.trim();
    const currentVersao = methods.getValues("versao")?.trim();
    const hasValidCurrentSelection = Boolean(
      currentProduto &&
      currentVersao &&
      agendaDevData.some(
        (a) =>
          String(a.id_produto) === currentProduto && a.versao === currentVersao,
      ),
    );
    if (hasValidCurrentSelection) {
      agendaInitRef.current = true;
      return;
    }

    agendaInitRef.current = true;
    const storedOrdem =
      typeof window !== "undefined"
        ? localStorage.getItem(PAINEL_PRODUTO_ORDEM_KEY)
        : null;
    const match = storedOrdem
      ? agendaDevData.find((a) => a.ordem === storedOrdem)
      : agendaDevData[0];
    if (match) {
      setValue("produto", String(match.id_produto), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValue("versao", match.versao ?? "", {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [agendaDevData, hydrated, methods, setValue]);

  useEffect(() => {
    if (!agendaDevData?.length || !produto?.trim() || !versao?.trim()) return;
    const match = agendaDevData.find(
      (a) =>
        String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
    );
    if (match && typeof window !== "undefined") {
      localStorage.setItem(PAINEL_PRODUTO_ORDEM_KEY, match.ordem);
    }
  }, [agendaDevData, produto, versao]);

  const hasValidSelection = hasValidAgendaSelection(
    agendaDevData,
    produto ?? "",
    versao ?? "",
  );

  const memoriaEnabled =
    hydrated &&
    Boolean(apiFiltros?.devAtribuidoId) &&
    agendaQuery.isSuccess &&
    !isAgendaFetching &&
    hasValidSelection;

  const cronogramaIdAgenda = apiFiltros?.cronogramaId;

  const baseParams = {
    per_page: 15,
    usuario_dev_id: apiFiltros?.devAtribuidoId ?? "",
    produto_id: produto?.trim() ?? "",
    versao_produto: versao?.trim() ?? "",
    ...(cronogramaIdAgenda ? { projeto_id: cronogramaIdAgenda } : {}),
  };

  const abertosQ = useProjetoMemoria(
    { ...baseParams, status_id: ["1", "2"] },
    { enabled: memoriaEnabled },
  );
  const corrigidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "3" },
    { enabled: memoriaEnabled },
  );
  const retornosQ = useProjetoMemoria(
    { ...baseParams, status_id: "4" },
    { enabled: memoriaEnabled },
  );
  const concluidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "9" },
    { enabled: memoriaEnabled },
  );

  const abertosItems = useMemo(() => {
    const pages = abertosQ.data?.pages ?? [];
    const raw = pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "abertos")),
    );
    return sortAbertosIniciadosPrimeiro(raw);
  }, [abertosQ.data]);

  const corrigidosItems = useMemo(() => {
    const pages = corrigidosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "corrigidos")),
    );
  }, [corrigidosQ.data]);

  const retornosItems = useMemo(() => {
    const pages = retornosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "retornos")),
    );
  }, [retornosQ.data]);

  const concluidosItems = useMemo(() => {
    const pages = concluidosQ.data?.pages ?? [];
    return pages.flatMap((p) =>
      p.data.map((item) => mapProjetoMemoriaItemToKanban(item, "concluidos")),
    );
  }, [concluidosQ.data]);

  const mergedFromApi = useMemo(
    () =>
      dedupePainelKanbanItemsById([
        ...abertosItems,
        ...corrigidosItems,
        ...retornosItems,
        ...concluidosItems,
      ]),
    [abertosItems, corrigidosItems, retornosItems, concluidosItems],
  );

  const agendaRowForFilters = useMemo(() => {
    if (!agendaDevData?.length || !produto?.trim() || !versao?.trim()) {
      return null;
    }
    return (
      agendaDevData.find(
        (a) =>
          String(a.id_produto) === produto.trim() && a.versao === versao.trim(),
      ) ?? null
    );
  }, [agendaDevData, produto, versao]);

  const columnBadgeCounts = useMemo(():
    | Partial<Record<PainelKanbanColumnId, number>>
    | undefined => {
    if (!agendaRowForFilters) return undefined;
    return {
      abertos: parseAgendaDevCount(agendaRowForFilters.abertos),
      corrigidos: parseAgendaDevCount(agendaRowForFilters.corrigidos),
      retornos: parseAgendaDevCount(agendaRowForFilters.retornos),
      concluidos: parseAgendaDevCount(agendaRowForFilters.resolvidos),
    };
  }, [agendaRowForFilters]);

  const columnLoad = useMemo(
    () => ({
      abertos: {
        hasNextPage: Boolean(abertosQ.hasNextPage),
        isFetchingNextPage: abertosQ.isFetchingNextPage,
        fetchNextPage: () => void abertosQ.fetchNextPage(),
        isLoading: abertosQ.isLoading,
      },
      corrigidos: {
        hasNextPage: Boolean(corrigidosQ.hasNextPage),
        isFetchingNextPage: corrigidosQ.isFetchingNextPage,
        fetchNextPage: () => void corrigidosQ.fetchNextPage(),
        isLoading: corrigidosQ.isLoading,
      },
      retornos: {
        hasNextPage: Boolean(retornosQ.hasNextPage),
        isFetchingNextPage: retornosQ.isFetchingNextPage,
        fetchNextPage: () => void retornosQ.fetchNextPage(),
        isLoading: retornosQ.isLoading,
      },
      concluidos: {
        hasNextPage: Boolean(concluidosQ.hasNextPage),
        isFetchingNextPage: concluidosQ.isFetchingNextPage,
        fetchNextPage: () => void concluidosQ.fetchNextPage(),
        isLoading: concluidosQ.isLoading,
      },
    }),
    [abertosQ, corrigidosQ, retornosQ, concluidosQ],
  );

  return {
    agendaDevData,
    isAgendaLoading,
    isAgendaFetching,
    showKanbanSkeleton,
    queryEnabled: memoriaEnabled,
    agendaRowForFilters,
    columnBadgeCounts,
    columnLoad,
    mergedFromApi,
    cronogramaIdAgenda,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PainelPageHeader } from "@/components/painel/painel-page-header";
import { PainelKanbanFiltros } from "@/components/painel-kanban/filtros/painel-kanban-filtros";
import { PainelKanbanProdutosModal } from "@/components/painel-kanban/filtros/painel-kanban-produtos-modal";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { PainelKanbanBoard } from "@/components/painel-kanban/kanban/painel-kanban-board";
import { PainelKanbanSkeleton } from "@/components/painel-kanban/layout/painel-kanban-skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import { useAgendaDev } from "@/hooks/use-agenda-dev";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import { parseAgendaDevCount } from "@/services/auxiliar/get-agenda-dev";
import { useUpdateCaso } from "@/hooks/use-update-caso";
import { getUser, PAINEL_PRODUTO_ORDEM_KEY } from "@/lib/auth";
import {
  columnIdToApiStatus,
  PAINEL_KANBAN_COLUMN_IDS,
  type PainelKanbanColumnId,
} from "@/components/painel-kanban/kanban/painel-kanban-columns";
import {
  dedupePainelKanbanItemsById,
  mapProjetoMemoriaItemToKanban,
  sortAbertosIniciadosPrimeiro,
  type PainelKanbanItem,
} from "@/components/painel-kanban/kanban/painel-kanban-map";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

function isColumnId(id: string): id is PainelKanbanColumnId {
  return (PAINEL_KANBAN_COLUMN_IDS as readonly string[]).includes(id);
}

const PAINEL_KANBAN_FILTROS_KEY = "PAINEL_KANBAN_FILTROS";

export function PainelKanban() {
  const user = getUser();
  const idColaborador = user?.id ? String(user.id) : "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateCaso = useUpdateCaso();

  const methods = useForm<PainelKanbanFiltrosForm>({
    defaultValues: {
      produto: "",
      versao: "",
      devAtribuido: idColaborador,
    },
  });

  const { watch, setValue } = methods;
  const produto = watch("produto");
  const versao = watch("versao");
  const devAtribuido = watch("devAtribuido");

  const usuarioDevId = devAtribuido?.trim() || idColaborador;

  const isRestoringFiltrosRef = useRef(true);
  const [filtrosRestaurados, setFiltrosRestaurados] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PAINEL_KANBAN_FILTROS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<PainelKanbanFiltrosForm>;

      const savedDev = saved.devAtribuido?.trim();
      setValue("devAtribuido", savedDev ? savedDev : idColaborador);

      if (saved.produto?.trim()) setValue("produto", saved.produto);
      if (saved.versao?.trim()) setValue("versao", saved.versao);
    } catch {
      // Ignora valores inválidos no localStorage.
    } finally {
      isRestoringFiltrosRef.current = false;
      setFiltrosRestaurados(true);
    }
  }, [idColaborador, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sub = methods.watch((values) => {
      if (isRestoringFiltrosRef.current) return;

      const payload: PainelKanbanFiltrosForm = {
        produto: values.produto ?? "",
        versao: values.versao ?? "",
        devAtribuido: values.devAtribuido?.trim()
          ? values.devAtribuido
          : idColaborador,
      };

      try {
        localStorage.setItem(PAINEL_KANBAN_FILTROS_KEY, JSON.stringify(payload));
      } catch {
        // Sem ação: storage pode estar indisponível/cheio.
      }
    });

    return () => sub.unsubscribe();
  }, [idColaborador, methods]);

  const { data: agendaDevData, isLoading: isAgendaLoading } = useAgendaDev({
    id_colaborador: usuarioDevId,
  });

  const agendaInitRef = useRef(false);
  const lastUsuarioDevIdRef = useRef<string>("");
  useEffect(() => {
    if (!usuarioDevId) return;
    if (lastUsuarioDevIdRef.current && lastUsuarioDevIdRef.current !== usuarioDevId) {
      agendaInitRef.current = false;
    }
    lastUsuarioDevIdRef.current = usuarioDevId;
  }, [usuarioDevId]);

  useEffect(() => {
    if (!filtrosRestaurados) return;
    if (!agendaDevData?.length || agendaInitRef.current) return;

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
      setValue("produto", String(match.id_produto));
      setValue("versao", match.versao ?? "");
    }
  }, [agendaDevData, filtrosRestaurados, methods, setValue]);

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

  const queryEnabled = Boolean(
    produto?.trim() && versao?.trim() && usuarioDevId,
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

  /** Totais da agenda (API) por coluna; `resolvidos` alinha à coluna concluídos. */
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

  const baseParams = {
    per_page: 15,
    usuario_dev_id: usuarioDevId,
    produto_id: produto?.trim() ?? "",
    versao_produto: versao?.trim() ?? "",
  };

  const abertosQ = useProjetoMemoria(
    { ...baseParams, status_id: ["1", "2"] },
    { enabled: queryEnabled },
  );
  const corrigidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "3" },
    { enabled: queryEnabled },
  );
  const retornosQ = useProjetoMemoria(
    { ...baseParams, status_id: "4" },
    { enabled: queryEnabled },
  );
  const concluidosQ = useProjetoMemoria(
    { ...baseParams, status_id: "9" },
    { enabled: queryEnabled },
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

  const [kanbanData, setKanbanData] = useState<PainelKanbanItem[]>([]);
  const [isProdutosModalOpen, setIsProdutosModalOpen] = useState(false);
  useEffect(() => {
    setKanbanData(mergedFromApi);
  }, [mergedFromApi]);

  const kanbanDataRef = useRef(kanbanData);
  kanbanDataRef.current = kanbanData;

  const columnDragStartRef = useRef<string>("");

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    const row = kanbanDataRef.current.find((i) => i.id === id);
    columnDragStartRef.current = row?.column ?? "";
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const fromCol = columnDragStartRef.current;
      const dataNow = kanbanDataRef.current;
      const overItem = dataNow.find((i) => i.id === overId);
      const targetCol: PainelKanbanColumnId | null = overItem
        ? (overItem.column as PainelKanbanColumnId)
        : isColumnId(overId)
          ? overId
          : null;
      if (!targetCol || !fromCol || fromCol === targetCol) {
        return;
      }
      const status = columnIdToApiStatus(targetCol);
      updateCaso.mutate(
        { id: activeId, data: { status } },
        {
          onSuccess: () => {
            toast.success("Status atualizado com sucesso.");
            queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
            queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Erro ao atualizar status.",
            );
            queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
            queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
          },
        },
      );
    },
    [queryClient, updateCaso],
  );

  const handleAtualizar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
  }, [queryClient]);

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

  if (!idColaborador) {
    return (
      <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
        <PainelPageHeader
          onVerCasos={() => router.push("/casos")}
          onAtualizar={handleAtualizar}
        />
        <EmptyState
          icon={LayoutGrid}
          title="Sessão inválida"
          description="Não foi possível identificar o colaborador logado."
        />
      </div>
    );
  }

  if (isAgendaLoading) {
    return <PainelKanbanSkeleton />;
  }

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <PainelPageHeader
        onVerCasos={() => router.push("/casos")}
        onAtualizar={handleAtualizar}
      />

      <PainelKanbanFiltros
        methods={methods}
        agendaItems={agendaDevData ?? []}
        onEditarQuadroClick={() => setIsProdutosModalOpen(true)}
      />

      <PainelKanbanProdutosModal
        open={isProdutosModalOpen}
        onOpenChange={setIsProdutosModalOpen}
        idColaborador={usuarioDevId}
      />

      {!queryEnabled ? (
        <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
          <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Quadro Kanban
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <EmptyState
              icon={LayoutGrid}
              title="Selecione produto e versão"
              description="Escolha o produto, o responsável e a versão nos filtros acima para carregar os casos no quadro."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PainelKanbanBoard
            data={kanbanData}
            onDataChange={setKanbanData}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            columnBadgeCounts={columnBadgeCounts}
            columnLoad={columnLoad}
          />
        </div>
      )}
    </div>
  );
}

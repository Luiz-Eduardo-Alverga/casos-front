"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { EmptyState } from "@/components/painel/empty-state";
import { AUTO_REFETCH_INTERVAL_MS } from "@/lib/query-refetch-intervals";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { ReportsListaSkeleton } from "./reports-lista-skeleton";
import { ReportCard } from "./report-card";
import { ReportAprovarModal } from "./report-aprovar-modal";
import { useReportAcoes } from "./use-report-acoes";
import { mapProjetoMemoriaToReportCard } from "./utils";
import type { ReportsFiltrosAplicados } from "./types";

interface ReportsListaProps {
  filtros: ReportsFiltrosAplicados;
}

export function ReportsLista({ filtros }: ReportsListaProps) {
  const router = useRouter();
  const { aprovar, marcarIncompleto, suspender, isPending } = useReportAcoes();
  const [itemParaAprovar, setItemParaAprovar] =
    useState<ProjetoMemoriaItem | null>(null);
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);

  const setorFiltro = filtros.setor?.trim() ?? "";
  const hasSetor = Boolean(setorFiltro);

  const params = useMemo(() => {
    const produtoId = filtros.produto?.trim();
    return {
      analise_aprovado: false,
      tipo_abertura: "REPORT" as const,
      ...(setorFiltro ? { setor: setorFiltro } : {}),
      ...(produtoId ? { produto_id: produtoId } : {}),
    };
  }, [setorFiltro, filtros.produto]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(params, {
      enabled: hasSetor,
      refetchInterval: hasSetor ? AUTO_REFETCH_INTERVAL_MS : false,
    });

  const itens = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAbrirAprovar = (item: ProjetoMemoriaItem) => {
    setItemParaAprovar(item);
    setAprovarModalOpen(true);
  };

  if (!hasSetor) {
    return (
      <EmptyState
        icon={Inbox}
        title="Selecione um setor"
        description="Escolha um setor no filtro para visualizar os reports abertos."
      />
    );
  }

  if (isLoading) {
    return <ReportsListaSkeleton />;
  }

  if (itens.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Nenhum report encontrado"
        description="Ajuste os filtros ou não há reports abertos no momento."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {itens.map((item) => {
          const cardData = mapProjetoMemoriaToReportCard(item);
          return (
            <ReportCard
              key={cardData.id}
              data={cardData}
              disabled={isPending}
              onAprovar={() => handleAbrirAprovar(item)}
              onMarcarIncompleto={() => marcarIncompleto(cardData.id)}
              onSuspender={() => suspender(cardData.id)}
              onVerCaso={() =>
                router.push(buildCasoEditHref(cardData.id, "case"))
              }
            />
          );
        })}

        {hasNextPage && itens.length > 0 && (
          <div ref={loadMoreRef} className="min-h-[48px]" />
        )}
      </div>

      <ReportAprovarModal
        open={aprovarModalOpen}
        onOpenChange={setAprovarModalOpen}
        item={itemParaAprovar}
        onAprovar={aprovar}
        isLoading={isPending}
      />
    </>
  );
}

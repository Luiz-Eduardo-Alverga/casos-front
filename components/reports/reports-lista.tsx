"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { resolveSetorNome } from "@/components/reports/filtros/reports-filtros-mappers";
import { EmptyState } from "@/components/painel/empty-state";
import { AUTO_REFETCH_INTERVAL_MS } from "@/lib/query-refetch-intervals";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  ReportsListaNextPageSkeleton,
  ReportsListaSkeleton,
} from "./reports-lista-skeleton";
import { ReportCard } from "./report-card";
import { ReportAprovarModal } from "./report-aprovar-modal";
import {
  ReportAcaoAnotacaoModal,
  type ReportAcaoAnotacaoTipo,
} from "./report-acao-anotacao-modal";
import { useReportAcoes } from "./use-report-acoes";
import { mapProjetoMemoriaToReportCard } from "./utils";
import {
  DEFAULT_REPORTS_STATUS_IDS,
  type ReportsFiltrosAplicados,
} from "./types";

interface ReportsListaProps {
  filtros: ReportsFiltrosAplicados;
}

type ReportAcaoModalState = {
  tipo: ReportAcaoAnotacaoTipo;
  item: ProjetoMemoriaItem;
} | null;

export function ReportsLista({ filtros }: ReportsListaProps) {
  const router = useRouter();
  const { data: setores } = useSetores();
  const { aprovar, marcarIncompletoComAnotacao, suspenderComAnotacao, isPending } =
    useReportAcoes();
  const [itemParaAprovar, setItemParaAprovar] =
    useState<ProjetoMemoriaItem | null>(null);
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);
  const [acaoModal, setAcaoModal] = useState<ReportAcaoModalState>(null);

  const setorNome = resolveSetorNome(filtros.setor, setores);
  const hasSetor = Boolean(setorNome);

  const params = useMemo(() => {
    const produtoId = filtros.produto?.trim();
    const statusIds =
      filtros.status_ids?.length > 0
        ? filtros.status_ids
        : [...DEFAULT_REPORTS_STATUS_IDS];
    return {
      analise_aprovado: false,
      tipo_abertura: "REPORT" as const,
      status_id: statusIds,
      ...(setorNome ? { setor: setorNome } : {}),
      ...(produtoId ? { produto_id: produtoId } : {}),
      sort_by: "prioridade",
      sort_order: "DESC" as const,
    };
  }, [setorNome, filtros.produto, filtros.status_ids]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(params, {
      enabled: hasSetor,
      refetchInterval: hasSetor ? AUTO_REFETCH_INTERVAL_MS : false,
    });

  const itens = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

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

  const handleConfirmarAcaoComAnotacao = async (anotacao: string) => {
    if (!acaoModal) return false;

    const casoId = acaoModal.item.caso.id;
    if (acaoModal.tipo === "incompleto") {
      return marcarIncompletoComAnotacao(casoId, anotacao);
    }
    return suspenderComAnotacao(casoId, anotacao);
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
              onMarcarIncompleto={() =>
                setAcaoModal({ tipo: "incompleto", item })
              }
              onSuspender={() => setAcaoModal({ tipo: "suspender", item })}
              onVerCaso={() =>
                router.push(buildCasoEditHref(cardData.id, "case"))
              }
            />
          );
        })}

        {isFetchingNextPage && <ReportsListaNextPageSkeleton count={3} />}

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

      <ReportAcaoAnotacaoModal
        open={acaoModal != null}
        onOpenChange={(open) => {
          if (!open) setAcaoModal(null);
        }}
        tipo={acaoModal?.tipo ?? "incompleto"}
        reportData={
          acaoModal ? mapProjetoMemoriaToReportCard(acaoModal.item) : null
        }
        onConfirm={handleConfirmarAcaoComAnotacao}
        isLoading={isPending}
      />
    </>
  );
}

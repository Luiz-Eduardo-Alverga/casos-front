"use client";

import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  ReportsListaNextPageSkeleton,
  ReportsListaSkeleton,
} from "./reports-lista-skeleton";
import { ReportCard } from "./report-card";
import { mapProjetoMemoriaToReportCard } from "./utils";

interface ReportsListaProps {
  itens: ProjetoMemoriaItem[];
  isLoading: boolean;
  hasSetor: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  loadMoreRef: React.Ref<HTMLDivElement>;
  onAprovar: (item: ProjetoMemoriaItem) => void;
  onMarcarIncompleto: (item: ProjetoMemoriaItem) => void;
  onSuspender: (item: ProjetoMemoriaItem) => void;
  scrollable?: boolean;
}

export function ReportsLista({
  itens,
  isLoading,
  hasSetor,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  loadMoreRef,
  onAprovar,
  onMarcarIncompleto,
  onSuspender,
  scrollable = false,
}: ReportsListaProps) {
  const router = useRouter();

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
    <div
      className={
        scrollable
          ? "flex flex-col gap-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto"
          : "flex flex-col gap-4"
      }
    >
      {itens.map((item) => {
        const cardData = mapProjetoMemoriaToReportCard(item);
        return (
          <ReportCard
            key={cardData.id}
            data={cardData}
            disabled={isPending}
            onAprovar={() => onAprovar(item)}
            onMarcarIncompleto={() => onMarcarIncompleto(item)}
            onSuspender={() => onSuspender(item)}
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
  );
}

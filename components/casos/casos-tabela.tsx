"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { getUser } from "@/lib/auth";
import { ArrowLeftRight, Box, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/painel/empty-state";
import { CasosTabelaSkeleton } from "@/components/casos/layout/casos-tabela-skeleton";
import { Button } from "@/components/ui/button";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import { mapProjetoMemoriaToTabelaRow } from "@/components/projetos/tabela/map-projeto-memoria-to-escopo-row";
import { useBulkUpdateCasos } from "@/hooks/casos/use-bulk-update-casos";
import { CasosTransferenciaModal } from "@/components/casos/transferencia/casos-transferencia-modal";
import { buildBulkTransferPayload } from "@/components/casos/transferencia/utils";
import type { CasosTransferenciaFormValues } from "@/components/casos/transferencia/types";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import {
  filtrosToProjetoMemoriaParams,
  hasFiltersApplied,
  needsVersaoCatalogToResolve,
} from "@/components/casos/filtros/casos-filtros-mappers";
import { useVersoes } from "@/hooks/catalogos/use-versoes";
import { getVersoesQueryKey } from "@/components/casos/shared/versao-combobox";
import type { Versao } from "@/services/auxiliar/versoes";
import { AUTO_REFETCH_INTERVAL_MS } from "@/lib/query-refetch-intervals";

interface CasosTabelaProps {
  filtros: CasosFiltrosAplicados;
}

export function CasosTabela({ filtros }: CasosTabelaProps) {
  const user = getUser();
  const queryClient = useQueryClient();
  const bulkUpdateCasos = useBulkUpdateCasos();

  const hasFilters = useMemo(() => hasFiltersApplied(filtros), [filtros]);
  const produtoFiltro = filtros.produto?.trim() ?? "";
  const versaoFiltro = filtros.versao?.trim() ?? "";

  const { data: versoesCatalogo, isLoading: isVersoesCatalogoLoading } =
    useVersoes({
      produto_id: produtoFiltro,
      enabled: hasFilters && Boolean(produtoFiltro) && Boolean(versaoFiltro),
      todas: true,
    });

  const projetoMemoriaParams = useMemo(
    () => filtrosToProjetoMemoriaParams(filtros, versoesCatalogo),
    [filtros, versoesCatalogo],
  );

  const aguardandoVersaoCatalogo =
    hasFilters &&
    Boolean(produtoFiltro) &&
    Boolean(versaoFiltro) &&
    needsVersaoCatalogToResolve(versaoFiltro, versoesCatalogo) &&
    (isVersoesCatalogoLoading || !versoesCatalogo?.length);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(projetoMemoriaParams, {
      enabled: hasFilters && !aguardandoVersaoCatalogo,
      refetchInterval:
        hasFilters && !aguardandoVersaoCatalogo
          ? AUTO_REFETCH_INTERVAL_MS
          : false,
    });

  const itens = useMemo(
    () => data?.pages.flatMap((p) => p.data.map(mapProjetoMemoriaToTabelaRow)) ?? [],
    [data],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false);

  useEffect(() => {
    if (itens.length === 0) {
      setSelectedIds([]);
      return;
    }
    const idsAtuais = new Set(itens.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => idsAtuais.has(id)));
  }, [itens]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleToggleItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(itens.map((item) => item.id));
  };

  const handleTransferirCasos = async (values: CasosTransferenciaFormValues) => {
    const idsSelecionados = selectedIds;
    if (idsSelecionados.length === 0) {
      toast.error("Selecione ao menos um caso para transferir.");
      return;
    }

    const produtoId = String(filtros.produto ?? "").trim();
    const versoes = produtoId
      ? queryClient.getQueryData<Versao[]>(
          getVersoesQueryKey(produtoId, "", false),
        )
      : undefined;
    const payload = buildBulkTransferPayload(idsSelecionados, values, versoes);
    if (!payload) {
      toast.error("Preencha ao menos um campo para transferir.");
      return;
    }

    await bulkUpdateCasos.mutateAsync(payload);
    toast.success("Casos transferidos com sucesso.");
    setSelectedIds([]);
    setIsTransferenciaModalOpen(false);
  };

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(
        typeof window !== "undefined" && window.scrollY >= window.innerHeight,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Listagem de Casos
            </CardTitle>
          </div>

          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTransferenciaModalOpen(true)}
              disabled={selectedIds.length === 0}
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-text-primary" />
              {selectedIds.length > 0
                ? `Transferir casos (${selectedIds.length})`
                : "Transferir casos"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {!hasFilters ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum filtro aplicado"
            icon={Box}
            title="Nenhum filtro aplicado"
            description="Selecione os filtros e clique em 'Filtrar' para visualizar os casos."
            className="w-42 h-42"
          />
        ) : isLoading || aguardandoVersaoCatalogo ? (
          <CasosTabelaSkeleton />
        ) : itens.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum caso encontrado"
            icon={Box}
            title="Nenhum caso encontrado"
            description="Ajuste os filtros ou não há casos que correspondam aos critérios."
            className="w-42 h-42"
          />
        ) : (
          <>
            <ProjetosTabelaTable
              variant="escopo"
              itens={itens}
              isFetchingNextPage={isFetchingNextPage}
              showCheckbox
              selectedIds={selectedIds}
              onToggleItem={handleToggleItem}
              onToggleAll={handleToggleAll}
            />
            {hasNextPage && itens.length > 0 && (
              <div ref={loadMoreRef} className="mt-4 min-h-[48px]" />
            )}
          </>
        )}
      </CardContent>
      {showScrollTop && (
        <Button
          type="button"
          size="icon"
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      <CasosTransferenciaModal
        open={isTransferenciaModalOpen}
        onOpenChange={setIsTransferenciaModalOpen}
        totalSelecionados={selectedIds.length}
        produtoIdPadrao={filtros.produto}
        isSubmitting={bulkUpdateCasos.isPending}
        onSubmit={handleTransferirCasos}
      />
    </Card>
  );
}

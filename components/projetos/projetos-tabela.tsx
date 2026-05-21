"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { ProjetosTabelaSkeleton } from "@/components/projetos/layout/projetos-tabela-skeleton";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import { useSgpCadastrosInfinite } from "@/hooks/projetos/use-sgp-cadastros";
import { useSetores } from "@/hooks/catalogos/use-setores";
import type { ProjetosFiltrosAplicados } from "@/components/projetos/filtros/projetos-filtros.types";
import {
  canFetchSgpCadastros,
  filtrosToSgpCadastrosParams,
  hasFiltersApplied,
} from "@/components/projetos/filtros/projetos-filtros-mappers";

interface ProjetosTabelaProps {
  filtros: ProjetosFiltrosAplicados;
}

export function ProjetosTabela({ filtros }: ProjetosTabelaProps) {
  const { data: setores } = useSetores();
  const hasFilters = useMemo(() => hasFiltersApplied(filtros), [filtros]);
  const apiParams = useMemo(
    () => filtrosToSgpCadastrosParams(filtros, setores),
    [filtros, setores],
  );
  const canFetch = useMemo(
    () => canFetchSgpCadastros(filtros, setores),
    [filtros, setores],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSgpCadastrosInfinite(apiParams ?? {}, {
      enabled: hasFilters && canFetch,
    });

  const itens = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const waitingSetorResolve =
    hasFilters && filtros.setor?.trim() && !canFetch && !isLoading;

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Listagem de projetos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {!hasFilters ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum filtro aplicado"
            icon={FolderKanban}
            title="Nenhum filtro aplicado"
            description="Selecione os filtros e clique em 'Filtrar' para visualizar os projetos."
            className="w-42 h-42"
          />
        ) : waitingSetorResolve || isLoading ? (
          <ProjetosTabelaSkeleton />
        ) : itens.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-casos-produto.svg"
            imageAlt="Nenhum projeto encontrado"
            icon={FolderKanban}
            title="Nenhum projeto encontrado"
            description="Ajuste os filtros ou não há projetos que correspondam aos critérios."
            className="w-42 h-42"
          />
        ) : (
          <>
            <ProjetosTabelaTable
              itens={itens}
              isFetchingNextPage={isFetchingNextPage}
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
    </Card>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { MelhoriasTabelaSkeleton } from "@/components/melhorias/tabela/melhorias-tabela-skeleton";
import { MelhoriasTabelaTable } from "@/components/melhorias/tabela/melhorias-tabela-table";
import { usePainelIdeiasInfinite } from "@/hooks/painel/use-painel-ideias";
import { filtrosToPainelIdeiasParams } from "@/components/melhorias/filtros/melhorias-filtros-mappers";
import type { MelhoriasFiltrosState } from "@/components/melhorias/filtros/melhorias-filtros.types";

interface MelhoriasTabelaProps {
  filtros: MelhoriasFiltrosState;
}

export function MelhoriasTabela({ filtros }: MelhoriasTabelaProps) {
  const apiParams = useMemo(
    () => filtrosToPainelIdeiasParams(filtros),
    [filtros],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePainelIdeiasInfinite({ ...apiParams, per_page: 15 });

  const itens = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

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

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Melhorias
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {isLoading ? (
          <MelhoriasTabelaSkeleton />
        ) : itens.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title="Nenhuma melhoria encontrada"
            description="Ajuste ou limpe os filtros para ver mais resultados."
          />
        ) : (
          <>
            <MelhoriasTabelaTable itens={itens} />
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

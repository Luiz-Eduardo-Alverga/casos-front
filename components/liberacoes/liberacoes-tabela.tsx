"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, PackageCheck } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { LiberacoesTabelaSkeleton } from "@/components/liberacoes/layout/liberacoes-tabela-skeleton";
import { LiberacoesTabelaTable } from "@/components/liberacoes/tabela/liberacoes-tabela-table";
import { useLiberacoesInfinite } from "@/hooks/liberacoes/use-liberacoes";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { filtrosToLiberacoesParams } from "@/components/liberacoes/filtros/liberacoes-filtros-mappers";
import type { LiberacoesFiltrosState } from "@/components/liberacoes/filtros/liberacoes-filtros.types";

interface LiberacoesTabelaProps {
  filtros: LiberacoesFiltrosState;
}

export function LiberacoesTabela({ filtros }: LiberacoesTabelaProps) {
  const { data: produtos } = useProdutos();
  const apiParams = useMemo(() => filtrosToLiberacoesParams(filtros), [filtros]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLiberacoesInfinite(apiParams);

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

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Liberações
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {isLoading ? (
          <LiberacoesTabelaSkeleton />
        ) : itens.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Nenhuma liberação encontrada"
            description="Ajuste ou limpe os filtros para ver mais resultados."
          />
        ) : (
          <>
            <LiberacoesTabelaTable itens={itens} produtos={produtos} />
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

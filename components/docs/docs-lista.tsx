"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocs } from "@/hooks/docs/use-docs";
import { DocsListaItem } from "./lista/docs-lista-item";
import { DocsListaSkeleton } from "./layout/docs-lista-skeleton";
import type { DocFilters } from "@/services/db-api/docs";

export function DocsLista({
  filtros,
  canCreate,
}: {
  filtros: DocFilters;
  canCreate: boolean;
}) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDocs(filtros);
  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const total = data?.pages[0]?.total ?? 0;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              Documentos
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {items.length} de {total} documentos
          </span>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <DocsListaSkeleton />
        ) : items.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold">
              Nenhum documento encontrado
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Ajuste os filtros ou crie o primeiro documento da base.
            </p>
            {canCreate ? (
              <Button asChild className="mt-2">
                <Link href="/documentacao/novo">
                  <Plus className="h-4 w-4" />
                  Novo documento
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {items.map((doc) => (
              <DocsListaItem key={doc.id} doc={doc} />
            ))}
            {hasNextPage ? (
              <div ref={sentinelRef} className="min-h-16">
                {isFetchingNextPage ? <DocsListaSkeleton /> : null}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

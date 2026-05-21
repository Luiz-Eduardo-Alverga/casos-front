"use client";

import { useEffect, useRef } from "react";
import type { SgpUsuarioProjetoItem } from "@/interfaces/sgp-usuario-projeto";
import { UsuarioAutorizadoCard } from "@/components/projetos/edicao/stakes/usuario-autorizado-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface UsuariosGridProps {
  usuarios: SgpUsuarioProjetoItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

function UsuarioRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border-divider p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded" />
    </div>
  );
}

export function UsuariosGrid({
  usuarios,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UsuariosGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usuarios.map((item) => (
          <UsuarioAutorizadoCard key={item.sequencia} usuario={item} />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <UsuarioRowSkeleton />
          <UsuarioRowSkeleton />
        </div>
      )}
      {hasNextPage && usuarios.length > 0 && (
        <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
      )}
    </div>
  );
}

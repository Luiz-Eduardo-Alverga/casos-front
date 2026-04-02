"use client";

import { useEffect, useRef } from "react";
import { CasosProdutoSkeletonList } from "@/components/painel/casos-produto-skeleton";

interface KanbanColumnLoadSentinelProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function KanbanColumnLoadSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: KanbanColumnLoadSentinelProps) {
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

  return (
    <div ref={loadMoreRef} className="mt-4 w-full shrink-0">
      {isFetchingNextPage ? (
        <CasosProdutoSkeletonList count={3} />
      ) : (
        <div className="h-4 w-full shrink-0" aria-hidden />
      )}
    </div>
  );
}

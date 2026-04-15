"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProdutoOrdem } from "@/services/projeto-dev/get-produtos-ordem";
import { SortableRow } from "./sortable-row";
import { toSortableId } from "./utils";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProdutosModalListProps {
  items: ProdutoOrdem[];
  sensors: any;
  onDragEnd: (event: DragEndEvent) => void;

  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;

  editingItemId: string | null;
  editVersao: string;
  versoesEdicao: string[];
  isSavingEdicao: boolean;
  isDeleting: boolean;

  onStartEdit: (item: ProdutoOrdem) => void;
  onCancelEdit: () => void;
  onChangeEditVersao: (value: string) => void;
  onConfirmEdit: (item: ProdutoOrdem) => void;
  onDelete: (item: ProdutoOrdem) => void;
}

export function ProdutosModalList({
  items,
  sensors,
  onDragEnd,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  editingItemId,
  editVersao,
  versoesEdicao,
  isSavingEdicao,
  isDeleting,
  onStartEdit,
  onCancelEdit,
  onChangeEditVersao,
  onConfirmEdit,
  onDelete,
}: ProdutosModalListProps) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const skeletonRows = isFetchingNextPage ? 3 : 0;

  useEffect(() => {
    const root = scrollRootRef.current;
    const el = loadMoreRef.current;
    if (!root || !el || !hasNextPage || isFetchingNextPage) return;

    // Radix ScrollArea: viewport tem esse data-attr.
    const viewport = root.querySelector(
      "div[data-radix-scroll-area-viewport]",
    ) as Element | null;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: viewport, rootMargin: "120px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  return (
    <ScrollArea
      ref={scrollRootRef}
      className="h-[360px] w-full overflow-hidden rounded-md pr-2"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((item) => toSortableId(item))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 pb-1 pr-2">
            {items.length === 0 ? (
              <div className="rounded-lg border border-border-divider bg-white p-4 text-sm text-text-secondary">
                Nenhum produto configurado para este desenvolvedor.
              </div>
            ) : (
              items.map((item, index) => {
                const sortableId = toSortableId(item);
                const isEditing = editingItemId === String(item.id);
                return (
                  <SortableRow
                    key={sortableId}
                    item={item}
                    index={index}
                    sortableId={sortableId}
                    isEditing={isEditing}
                    editVersao={editVersao}
                    versoesEdicao={versoesEdicao}
                    isSavingEdicao={isSavingEdicao}
                    isDeleting={isDeleting}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onChangeEditVersao={onChangeEditVersao}
                    onConfirmEdit={onConfirmEdit}
                    onDelete={onDelete}
                  />
                );
              })
            )}

            {hasNextPage && items.length > 0 && (
              <div ref={loadMoreRef} className="mt-2 min-h-[32px]" />
            )}

            {skeletonRows > 0 && (
              <div className="space-y-3">
                {Array.from({ length: skeletonRows }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border-divider bg-white p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </ScrollArea>
  );
}


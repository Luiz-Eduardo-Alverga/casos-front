"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUTO_EDIT_ASIDE_WIDTH_CLASS } from "@/components/produtos/edicao/produto-edit-header";
import { cn } from "@/lib/utils";

function CardHeaderSkeleton({ titleWidthClass = "max-w-[11rem]" }: {
  titleWidthClass?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border-divider p-4 pb-2">
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
        <Skeleton className={cn("h-4 flex-1", titleWidthClass)} />
      </div>
    </div>
  );
}

export function ProdutoEditSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col px-6 pb-10 pt-20"
      role="status"
      aria-busy="true"
      aria-label="Carregando produto"
    >
      <div className="flex shrink-0 flex-col gap-2 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col border-b border-border pb-2">
          <div className="flex min-w-0 items-center gap-6 overflow-hidden">
            {["w-24", "w-16", "w-16", "w-20", "w-16"].map((width, index) => (
              <Skeleton
                key={`${width}-${index}`}
                className={cn("h-4 shrink-0 rounded-md", width)}
              />
            ))}
          </div>
        </div>
        <div
          className={cn(
            "flex w-full shrink-0 flex-row items-center gap-2",
            PRODUTO_EDIT_ASIDE_WIDTH_CLASS,
          )}
        >
          <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
          <Skeleton className="h-9 min-w-0 flex-1 rounded-md" />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-lg bg-card shadow-card">
              <CardHeaderSkeleton />
              <CardContent className="space-y-2 px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div
          className={cn(
            "hidden w-full shrink-0 flex-col gap-2 lg:flex lg:sticky lg:top-0 lg:self-start",
            PRODUTO_EDIT_ASIDE_WIDTH_CLASS,
          )}
        >
          <Card className="rounded-lg bg-card shadow-card">
            <div className="shrink-0 border-b border-border-divider p-4 pb-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-5 w-48" />
              <Skeleton className="mt-1 h-4 w-12" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <CardContent className="space-y-4 px-6 pb-6 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-lg bg-card shadow-card">
            <CardHeaderSkeleton titleWidthClass="max-w-[5rem]" />
            <CardContent className="px-6 pb-6 pt-2">
              <Skeleton className="h-9 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

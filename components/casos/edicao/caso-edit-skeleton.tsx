"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Larguras aproximadas dos rótulos das abas (Inicial, Anotações, Anexos, …). */
const TAB_PILL_WIDTHS = [
  "w-[4.5rem]",
  "w-[5.5rem]",
  "w-[4.25rem]",
  "w-[4.75rem]",
  "w-[4.75rem]",
  "w-[5.25rem]",
  "w-[5rem]",
];

const TAB_TRIGGER_OUTER = cn(
  "shrink-0 rounded-full px-3 py-1.5 min-h-9 flex items-center justify-center",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
);

function CardHeaderSkeleton({
  showBadge = true,
  showAberturaMeta = showBadge,
  titleWidthClass = "max-w-[11rem]",
}: {
  showBadge?: boolean;
  showAberturaMeta?: boolean;
  titleWidthClass?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border-divider p-4 pb-2">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
          <Skeleton className={cn("h-4", titleWidthClass)} />
        </div>
        {showAberturaMeta ? (
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2",
              "rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-1.5",
              "dark:border-sky-900/50 dark:bg-sky-950/25",
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-3.5 w-32 max-w-full rounded" />
              <Skeleton className="hidden h-3.5 w-36 max-w-full rounded sm:block" />
            </div>
            <Skeleton className="h-5 w-28 shrink-0 rounded-full" />
          </div>
        ) : (
          <div className="min-w-0 flex-1" aria-hidden />
        )}
        {showBadge ? (
          <Skeleton className="ml-auto h-7 w-14 shrink-0 rounded-full" />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Replica a hierarquia de {@link CasoEditForm}: Tabs (header em pills + ações),
 * corpo com linha lg (coluna esquerda aba Inicial + coluna direita 362px).
 */
export function CasoEditSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Carregando edição do caso"
    >
      {/* CasoEditHeader: TabsList + coluna de botões (362px em lg) */}
      <div className="flex shrink-0 flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div
            className={cn(
              "flex h-auto min-h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-card py-1 text-muted-foreground",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {TAB_PILL_WIDTHS.map((w, i) => (
              <div key={i} className={TAB_TRIGGER_OUTER}>
                <Skeleton className={cn("h-4 rounded-full", w)} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-row items-center gap-1.5 lg:w-[362px]">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="pointer-events-none h-9 w-9 shrink-0"
            disabled
            tabIndex={-1}
          >
            <Skeleton className="h-4 w-4 rounded" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none h-9 min-w-0 flex-1 px-2"
            disabled
            tabIndex={-1}
          >
            <Skeleton className="mr-1 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </Button>
          <Button
            type="button"
            className="pointer-events-none h-9 min-w-0 flex-1 px-2"
            disabled
            tabIndex={-1}
          >
            <Skeleton className="mr-1 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </Button>
        </div>
      </div>

      {/* mt-4 flex-1 overflow-auto — CasoEditForm */}
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex-1">
          <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
            {/* Coluna esquerda: AbaInicial (Informações + Classificação) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
              <Card className="h-full rounded-lg bg-card shadow-card">
                <CardHeaderSkeleton />
                <CardContent className="space-y-4 p-6 pt-3">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-36 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </CardContent>
              </Card>

              <Card className="rounded-lg bg-card shadow-card">
                <CardHeaderSkeleton showBadge={false} titleWidthClass="max-w-[14rem]" />
                <CardContent className="p-6 pt-3">
                  <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita: CasoEditColunaDireita (362px) — status + produto + atribuição */}
            <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[362px]">
              <Card className="rounded-lg bg-card shadow-card">
                <CardContent className="space-y-4 p-6 pt-3">
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>

              <Card className="rounded-lg bg-card shadow-card">
                <CardHeaderSkeleton showBadge={false} titleWidthClass="max-w-[8rem]" />
                <CardContent className="space-y-4 p-6 pt-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>

              <Card className="rounded-lg bg-card shadow-card">
                <CardHeaderSkeleton showBadge={false} titleWidthClass="max-w-[6rem]" />
                <CardContent className="space-y-4 p-6 pt-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

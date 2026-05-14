"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

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
  titleWidthClass = "max-w-[11rem]",
}: {
  showBadge?: boolean;
  titleWidthClass?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border-divider p-5 pb-2">
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
        <Skeleton className={cn("h-4 flex-1", titleWidthClass)} />
        {showBadge ? (
          <Skeleton className="h-7 w-14 shrink-0 rounded-full" />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Replica a hierarquia de {@link CasoEditForm}: Tabs (header em pills + ações),
 * corpo com pb-12, linha lg (coluna esquerda aba Inicial + coluna direita 362px),
 * rodapé fixo alinhado à sidebar como em {@link CasoEditRodapeAcoes}.
 */
export function CasoEditSkeleton() {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
              "flex h-auto min-h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-white py-1 text-muted-foreground",
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
        {/* CasoEditHeader — mesma hierarquia de caso-edit-header.tsx (135–176): Voltar / Clonar / Tooltip>span>Excluir */}
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 lg:w-[362px]">
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none flex-1 px-3"
            disabled
            tabIndex={-1}
          >
            <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none flex-1 px-3"
            disabled
            tabIndex={-1}
          >
            <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </Button>
          <span className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="pointer-events-none w-full px-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              disabled
              tabIndex={-1}
            >
              <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
              <Skeleton className="h-4 w-14 rounded" />
            </Button>
          </span>
        </div>
      </div>

      {/* mt-4 flex-1 overflow-auto — CasoEditForm */}
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex-1 pb-12">
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

      {/* CasoEditRodapeAcoes — footer fixo */}
      <footer
        className="fixed bottom-0 z-30 flex flex-row items-center justify-between gap-2 border-t border-border-divider bg-card px-6 py-4 shadow-card transition-all duration-300"
        style={{
          left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
          right: "0",
          width: isMobile
            ? "100%"
            : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
        }}
      >
        <div className="flex min-w-0 flex-row flex-wrap gap-2 sr-only sm:not-sr-only">
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
        <div className="flex flex-row gap-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </footer>
    </div>
  );
}

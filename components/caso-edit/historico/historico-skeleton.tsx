"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EVENT_PLACEHOLDER_COUNT = 4;

interface HistoricoEventSkeletonProps {
  marcadorPar: boolean;
}

function HistoricoEventSkeleton({ marcadorPar }: HistoricoEventSkeletonProps) {
  return (
    <section className="relative overflow-visible">
      <div
        className={cn(
          "absolute left-[-24px] top-1 z-10 h-6 w-6 -translate-x-1/2 rounded-full border border-white shadow-sm ring-4 ring-background",
          marcadorPar ? "bg-blue-100" : "bg-emerald-100",
        )}
      />

      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-[min(100%,220px)] max-w-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-[7.5rem] shrink-0 rounded-md" />
      </header>

      <div className="mt-2 space-y-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-lg bg-muted/30 px-4 py-2"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28 max-w-[55%]" />
                <Skeleton className="h-3 w-full max-w-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Estrutura espelhada da timeline do histórico (marcador na linha, cabeçalho, cards de campo).
 */
export function HistoricoTimelineSkeleton() {
  return (
    <div
      className="min-h-0 overflow-y-auto pr-1"
      role="status"
      aria-busy="true"
      aria-label="Carregando histórico do caso"
    >
      <div className="pl-5">
        <div className="space-y-6 border-l border-border-divider pl-6">
          {Array.from({ length: EVENT_PLACEHOLDER_COUNT }, (_, i) => (
            <HistoricoEventSkeleton key={i} marcadorPar={i % 2 === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

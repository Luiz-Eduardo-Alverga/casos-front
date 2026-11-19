"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLUNAS = ["w-[180px]", "w-[230px]", "w-[96px]", "w-[96px]", "w-[80px]", "w-[88px]", "flex-1", "w-[40px]"];

function UsuarioCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border-divider bg-background p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded" />
    </div>
  );
}

/** Carga inicial da aba Stakes: lista (header + 6 linhas + rodapé) e usuários autorizados. */
export function StakesListaSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-busy="true">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-6 pt-2">
          <Skeleton className="h-3 w-3/4" />
          <div className="overflow-x-auto rounded-lg border border-border-divider">
            <div className="min-w-[1080px]">
              <div className="flex gap-4 border-b border-border-divider px-4 py-3">
                {COLUNAS.map((largura, i) => (
                  <Skeleton key={i} className={`h-3 ${largura === "flex-1" ? "flex-1" : largura}`} />
                ))}
              </div>
              {Array.from({ length: 6 }).map((_, linha) => (
                <div
                  key={linha}
                  className="flex gap-4 border-b border-border-divider px-4 py-1.5 last:border-b-0"
                >
                  {COLUNAS.map((largura, i) => (
                    <Skeleton
                      key={i}
                      className={`h-8 ${largura === "flex-1" ? "flex-1" : largura}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <UsuarioCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

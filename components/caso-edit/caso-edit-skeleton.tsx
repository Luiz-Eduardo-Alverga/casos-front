"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton que replica o layout da tela de edição de caso (header, duas colunas, rodapé).
 */
export function CasoEditSkeleton() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header: tabs + botões */}
      <div className="flex flex-col lg:flex-row gap-6 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1 p-1 rounded-lg bg-muted w-full max-w-md">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Conteúdo: duas colunas */}
      <div className="mt-4 flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Coluna esquerda: Informações + Classificação */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita: Status, Dados do Produto, Atribuição */}
        <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rodapé fixo */}
      <div className="mt-6 pt-4 border-t border-border-divider flex justify-end gap-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

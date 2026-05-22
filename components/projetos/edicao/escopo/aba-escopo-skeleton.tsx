"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EscopoContentSkeleton } from "@/components/projetos/edicao/escopo/escopo-content-skeleton";

export function AbaEscopoSkeleton() {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-text-primary">
              Escopo do Projeto
            </CardTitle>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-[42px] w-full sm:w-[192px] rounded-lg" />
            <Skeleton className="h-[42px] w-full sm:w-[292px] rounded-lg" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <EscopoContentSkeleton />
      </CardContent>
    </Card>
  );
}

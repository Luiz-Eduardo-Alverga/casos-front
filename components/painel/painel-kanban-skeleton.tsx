"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { PainelPageHeader } from "@/components/painel/painel-page-header";

const COLS = 4;
const CARDS = 2;

export function PainelKanbanSkeleton() {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <PainelPageHeader isLoading />

      <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Filtros
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[72px] w-full rounded-lg" />
            <Skeleton className="h-[72px] w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-border-divider bg-card shadow-card"
          >
            <div className="flex items-center gap-2 border-b border-border-divider p-3">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-7 w-9 rounded-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {Array.from({ length: CARDS }).map((__, j) => (
                <Skeleton key={j} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatusAdquirentesSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Quadro Kanban de status
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="grid min-h-0 w-full flex-1 auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-[320px] min-w-[260px] flex-1 flex-col overflow-hidden rounded-lg border border-border-divider bg-card"
            >
              <div className="flex items-center gap-2 border-b border-border-divider px-3 py-3">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="ml-auto h-5 w-6 rounded-full" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

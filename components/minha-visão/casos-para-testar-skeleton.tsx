"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

const ROWS = 3;

export function CasosParaTestarSkeleton() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Casos Para Testar
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="flex flex-col gap-4">
          {Array.from({ length: ROWS }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-border-divider rounded-lg p-5"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton
                      key={j}
                      className="h-7 w-9 rounded-full shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

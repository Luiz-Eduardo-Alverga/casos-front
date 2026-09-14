"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function IndicadoresSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Card className="overflow-hidden rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-1.5 w-full rounded-full" />
        </CardContent>
      </Card>

      <div className="mt-4 hidden grid-cols-2 gap-6 lg:grid">
        {[4, 3].map((rows, colIndex) => (
          <Card
            key={colIndex}
            className="overflow-hidden rounded-lg bg-card shadow-card"
          >
            <CardHeader className="border-b border-border-divider p-4 pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex flex-col gap-2 border-t border-border-divider px-6 py-4"
                >
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-5 w-32 rounded-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="mt-1 h-1 w-full rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-lg bg-card shadow-card lg:hidden">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border-t border-border-divider px-4 py-4"
            >
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

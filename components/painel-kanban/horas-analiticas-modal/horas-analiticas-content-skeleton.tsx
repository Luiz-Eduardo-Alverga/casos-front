"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_CARDS = 3;
const CASE_ROWS = 2;

export function HorasAnaliticasContentSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: SUMMARY_CARDS }).map((_, index) => (
          <article
            key={index}
            className="rounded-lg border border-border-divider bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="mt-3 h-3 w-24" />
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
        <header className="flex items-center justify-between border-b border-border-divider bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </header>

        <div className="space-y-3 p-4">
          {Array.from({ length: CASE_ROWS }).map((_, index) => (
            <article
              key={index}
              className="rounded-lg border border-border-divider px-4 py-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-14 rounded" />
                  </div>
                  <Skeleton className="h-4 w-72 max-w-full" />
                </div>
                <Skeleton className="h-7 w-7 rounded" />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border-divider bg-card shadow-sm">
        <header className="flex items-center justify-between border-b border-border-divider bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-5 w-32" />
        </header>

        <div className="min-h-20 px-4 py-4">
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </section>
    </>
  );
}

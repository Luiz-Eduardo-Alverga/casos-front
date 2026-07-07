"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

const TAB_PILL_WIDTHS = [
  "w-[4.75rem]",
  "w-[4rem]",
  "w-[5.5rem]",
  "w-[4rem]",
  "w-[3.75rem]",
];

const TAB_TRIGGER_OUTER = cn(
  "flex min-h-9 shrink-0 items-center justify-center rounded-full px-3 py-1.5",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
);

function CardHeaderSkeleton({ titleWidthClass = "max-w-[11rem]" }: {
  titleWidthClass?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border-divider p-4 pb-2">
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
        <Skeleton className={cn("h-4 flex-1", titleWidthClass)} />
      </div>
    </div>
  );
}

export function ProjetoEditSkeleton() {
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
      aria-label="Carregando edição do projeto"
    >
      <div className="flex shrink-0 flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div
            className={cn(
              "flex h-auto min-h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-card py-1",
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
        <div className="flex w-full shrink-0 flex-row gap-2 lg:w-[362px]">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-6 overflow-auto pb-24 lg:flex-row">
        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[362px]">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-lg bg-card shadow-card">
              <CardHeaderSkeleton />
              <CardContent className="space-y-2 p-6 pt-2">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="min-w-0 flex-1 rounded-lg bg-card shadow-card">
          <CardHeaderSkeleton titleWidthClass="max-w-[14rem]" />
          <CardContent className="space-y-2 p-6 pt-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="min-h-[120px] w-full rounded-md" />
            <Skeleton className="min-h-[120px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

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
        <Skeleton className="hidden h-4 max-w-md sm:block sm:w-64" />
        <div className="ml-auto flex flex-row gap-2">
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </footer>
    </div>
  );
}

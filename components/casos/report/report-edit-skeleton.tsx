"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

const TAB_PILL_WIDTHS = [
  "w-[4.5rem]",
  "w-[5.5rem]",
  "w-[4.25rem]",
  "w-[4.75rem]",
  "w-[4.75rem]",
  "w-[5rem]",
];

const TAB_TRIGGER_OUTER = cn(
  "shrink-0 rounded-full px-3 py-1.5 min-h-9 flex items-center justify-center",
  "lg:flex-1 lg:min-w-0 lg:basis-0",
);

function CardHeaderSkeleton({
  titleWidthClass = "max-w-[11rem]",
}: {
  titleWidthClass?: string;
}) {
  return (
    <div className="shrink-0 border-b border-border-divider p-5 pb-2">
      <div className="flex w-full items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
        <Skeleton className={cn("h-4 flex-1", titleWidthClass)} />
      </div>
    </div>
  );
}

export function ReportEditSkeleton() {
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
      aria-label="Carregando edição do report"
    >
      <div className="flex shrink-0 flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div
            className={cn(
              "flex h-auto min-h-9 w-full max-w-full min-w-0 flex-nowrap items-center justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-full bg-white py-1 text-muted-foreground",
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
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 lg:w-[312px]">
          <Button type="button" variant="outline" className="pointer-events-none flex-1 px-3" disabled tabIndex={-1}>
            <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </Button>
          <Button type="button" variant="outline" className="pointer-events-none flex-1 px-3" disabled tabIndex={-1}>
            <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </Button>
          <Button type="button" variant="outline" className="pointer-events-none flex-1 px-3" disabled tabIndex={-1}>
            <Skeleton className="mr-1.5 h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex-1 pb-12">
          <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
              {[1, 2, 3].map((key) => (
                <Card key={key} className="rounded-lg bg-card shadow-card">
                  <CardHeaderSkeleton />
                  <CardContent className="space-y-4 p-6 pt-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Skeleton className="h-10 rounded-lg" />
                      <Skeleton className="h-10 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[312px]">
              {[1, 2, 3].map((key) => (
                <Card key={key} className="rounded-lg bg-card shadow-card">
                  <CardHeaderSkeleton titleWidthClass="max-w-[10rem]" />
                  <CardContent className="space-y-3 p-4 pt-3">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
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
        <div className="flex min-w-0 flex-row flex-wrap gap-2 sr-only sm:not-sr-only">
          <Skeleton className="h-4 w-full max-w-xl rounded" />
        </div>
        <div className="flex flex-row gap-2">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </footer>
    </div>
  );
}

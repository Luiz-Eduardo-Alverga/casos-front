import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PapeisSidebarSkeleton } from "./papeis-sidebar-skeleton";
import { PermissionMatrixSkeleton } from "./permission-matrix-skeleton";

export function PapeisEAcessosSkeleton() {
  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-28" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="w-full lg:w-[363px] flex flex-col lg:min-h-0">
          <PapeisSidebarSkeleton />
        </div>
        <div className="flex flex-col gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <Card className="bg-card shadow-card rounded-lg">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-3 space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <PermissionMatrixSkeleton />
        </div>
      </div>
    </div>
  );
}

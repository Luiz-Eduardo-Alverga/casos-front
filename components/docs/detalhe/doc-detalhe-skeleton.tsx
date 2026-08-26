import { Skeleton } from "@/components/ui/skeleton";

export function DocDetalheSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-10 pt-20">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="min-h-[520px] rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function AdquirentesStatusCardSkeleton() {
  return (
    <div className="space-y-6 rounded-2xl border border-[#d7dde4] bg-white p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border bg-zinc-50 px-2 py-2 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto mt-2 h-8 w-16" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="ml-auto h-5 w-20" />
        </div>
      </div>

      <div className="mb-3 space-y-2">
        <Skeleton className="h-4 w-14" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      <div className="border-t border-secondary pt-2">
        <Skeleton className="mb-2 h-4 w-36" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}


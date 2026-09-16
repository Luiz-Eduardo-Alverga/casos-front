import { Skeleton } from "@/components/ui/skeleton";

export function DocAnexosSkeleton({ showUpload }: { showUpload: boolean }) {
  return (
    <div className="space-y-6">
      {showUpload ? <Skeleton className="h-48 w-full rounded-lg" /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  );
}

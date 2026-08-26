import { Skeleton } from "@/components/ui/skeleton";

export function DocsListaSkeleton() {
  return (
    <div aria-label="Carregando documentos">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 border-t border-border-divider px-6 py-4 first:border-t-0"
        >
          <Skeleton className="h-4 w-4 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

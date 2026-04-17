import { AdquirentesStatusCardSkeleton } from "./adquirentes-status-card-skeleton";

export function AdquirentesSkeletonGrid() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="min-w-0">
          <AdquirentesStatusCardSkeleton />
        </div>
      ))}
    </div>
  );
}


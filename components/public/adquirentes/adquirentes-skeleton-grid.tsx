import { AdquirentesStatusCardSkeleton } from "./adquirentes-status-card-skeleton";

export function AdquirentesSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, idx) => (
        <AdquirentesStatusCardSkeleton key={`skeleton-${idx}`} />
      ))}
    </div>
  );
}


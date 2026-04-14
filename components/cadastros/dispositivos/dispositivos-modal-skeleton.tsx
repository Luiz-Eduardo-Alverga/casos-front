import { Skeleton } from "@/components/ui/skeleton";

/**
 * Espelha o formulário do modal de dispositivo (campo nome + hint + ações).
 */
export function DispositivosModalSkeleton() {
  return (
    <div className="px-6 pb-8 pt-6 space-y-8" aria-busy aria-label="Carregando formulário">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-24 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-28 rounded-lg" />
      </div>
    </div>
  );
}

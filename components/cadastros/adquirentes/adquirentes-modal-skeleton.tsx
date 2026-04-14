import { Skeleton } from "@/components/ui/skeleton";

/**
 * Espelha o formulário do modal de adquirente (nome, URL logo, cartão 4G, ações).
 */
export function AdquirentesModalSkeleton() {
  return (
    <div className="px-6 pb-8 pt-6 space-y-4" aria-busy aria-label="Carregando formulário">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-full max-w-[280px]" />
        <div className="flex justify-end pt-1">
          <Skeleton className="h-7 w-12 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
        <Skeleton className="h-10 w-full sm:w-24 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-28 rounded-lg" />
      </div>
    </div>
  );
}

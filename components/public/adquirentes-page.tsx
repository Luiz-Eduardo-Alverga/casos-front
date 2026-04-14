"use client";

import { useMemo } from "react";
import { usePublicAcquirersList } from "@/hooks/use-public-acquirers-list";
import { STATUS_TYPE_VALUES } from "@/lib/validators/db/shared";
import { AdquirentesPageHeader } from "@/components/public/adquirentes/adquirentes-page-header";
import { AdquirentesPageFilters } from "@/components/public/adquirentes/adquirentes-page-filters";
import { AdquirentesStatusCard } from "@/components/public/adquirentes/adquirentes-status-card";
import { AdquirentesSkeletonGrid } from "@/components/public/adquirentes/adquirentes-skeleton-grid";

interface AdquirentesPageProps {
  initialSearch: string;
  initialStatus: string;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Não foi possível carregar as adquirentes. Tente novamente em instantes.";
}

export function AdquirentesPage({
  initialSearch,
  initialStatus,
}: AdquirentesPageProps) {
  const {
    searchInput,
    setSearchInput,
    statusFilter,
    rows,
    showTableSkeleton,
    isError,
    error,
  } = usePublicAcquirersList(initialSearch, initialStatus);

  const statusOptions = useMemo(() => STATUS_TYPE_VALUES, []);

  return (
    <main className="min-h-screen bg-page-background">
      <AdquirentesPageHeader />

      <section className="w-full px-4 py-4 md:px-14">
        <AdquirentesPageFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          statusValue={statusFilter?.value ?? ""}
          onStatusValueChange={(value) => statusFilter?.setValue(value)}
          statusOptions={statusOptions}
        />

        {showTableSkeleton ? (
          <AdquirentesSkeletonGrid />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
            {errorMessage(error)}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-[#d7dde4] bg-white p-8 text-center text-[#6b7280]">
            Nenhuma adquirente encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            {rows.map((row) => (
              <AdquirentesStatusCard key={row.acquirer.id} row={row} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

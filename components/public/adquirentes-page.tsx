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

export function AdquirentesPage({
  initialSearch,
  initialStatus,
}: AdquirentesPageProps) {
  const { searchInput, setSearchInput, statusFilter, rows, showTableSkeleton } =
    usePublicAcquirersList(initialSearch, initialStatus);

  const statusOptions = useMemo(() => STATUS_TYPE_VALUES, []);
  const orderedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.acquirer.name.localeCompare(b.acquirer.name, "pt-BR");
    });
  }, [rows]);

  return (
    <main className="min-h-screen bg-[#eef1f5]">
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
        ) : orderedRows.length === 0 ? (
          <div className="rounded-lg border border-[#d7dde4] bg-white p-8 text-center text-[#6b7280]">
            Nenhuma adquirente encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {orderedRows.map((row) => (
              <AdquirentesStatusCard key={row.acquirer.id} row={row} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

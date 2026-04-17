"use client";

import { useMemo } from "react";
import { usePublicAcquirersList } from "@/hooks/use-public-acquirers-list";
import { STATUS_TYPE_VALUES } from "@/lib/validators/db/shared";
import {
  AdquirentesPageHeader,
  ADQUIRENTES_PAGE_CONTENT_SHELL,
} from "@/components/public/adquirentes/adquirentes-page-header";
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
    <main className="flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip bg-page-background">
      <AdquirentesPageHeader />

      <div
        className={`flex min-h-0 flex-1 flex-col ${ADQUIRENTES_PAGE_CONTENT_SHELL}`}
      >
        <AdquirentesPageFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          statusValue={statusFilter?.value ?? ""}
          onStatusValueChange={(value) => statusFilter?.setValue(value)}
          statusOptions={statusOptions}
        />

        <div className="min-w-0 flex-1">
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
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {rows.map((row) => (
                <div key={row.acquirer.id} className="min-w-0">
                  <AdquirentesStatusCard row={row} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

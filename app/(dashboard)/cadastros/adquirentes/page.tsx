import { Suspense } from "react";
import { CadastroListSkeleton } from "@/components/cadastros/cadastro-list-skeleton";
import { Adquirentes } from "@/components/cadastros/adquirentes/adquirentes";
import type { AcquirerRow } from "@/lib/db/acquirers";
import { DB_CACHE_TAG, fetchApiDbJson } from "@/lib/server/fetch-api-db";

async function AdquirentesData({ search }: { search: string }) {
  const data = await fetchApiDbJson<AcquirerRow[]>(
    "/api/db/acquirers",
    DB_CACHE_TAG.acquirers,
    search.trim() ? { search: search.trim() } : undefined,
  );
  return (
    <Suspense fallback={null}>
      <Adquirentes initialData={data} initialSearch={search} />
    </Suspense>
  );
}

export default async function CadastrosAdquirentesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  return (
    <Suspense
      key={search}
      fallback={
        <CadastroListSkeleton
          title="Adquirentes"
          description="Cadastro base de adquirentes utilizados nos casos"
        />
      }
    >
      <AdquirentesData search={search} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { CadastroListSkeleton } from "@/components/cadastros/cadastro-list-skeleton";
import { Versoes } from "@/components/cadastros/versoes/versoes";
import type { VersionRow } from "@/lib/db/versions";
import { DB_CACHE_TAG, fetchApiDbJson } from "@/lib/server/fetch-api-db";

async function VersoesData({ search }: { search: string }) {
  const data = await fetchApiDbJson<VersionRow[]>(
    "/api/db/versions",
    DB_CACHE_TAG.versions,
    search.trim() ? { search: search.trim() } : undefined,
  );
  return (
    <Suspense fallback={null}>
      <Versoes initialData={data} initialSearch={search} />
    </Suspense>
  );
}

export default async function CadastrosVersoesPage({
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
          title="Versões"
          description="Cadastro base de versões de produto"
        />
      }
    >
      <VersoesData search={search} />
    </Suspense>
  );
}

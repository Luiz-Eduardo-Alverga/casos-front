import { Suspense } from "react";
import { CadastroListSkeleton } from "@/components/cadastros/cadastro-list-skeleton";
import { Dispositivos } from "@/components/cadastros/dispositivos/dispositivos";
import type { DeviceRow } from "@/lib/db/devices";
import { DB_CACHE_TAG, fetchApiDbJson } from "@/lib/server/fetch-api-db";

async function DispositivosData({ search }: { search: string }) {
  const data = await fetchApiDbJson<DeviceRow[]>(
    "/api/db/devices",
    DB_CACHE_TAG.devices,
    search.trim() ? { search: search.trim() } : undefined,
  );
  return (
    <Suspense fallback={null}>
      <Dispositivos initialData={data} initialSearch={search} />
    </Suspense>
  );
}

export default async function CadastrosDispositivosPage({
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
          title="Dispositivos"
          description="Cadastro base de dispositivos compatíveis"
        />
      }
    >
      <DispositivosData search={search} />
    </Suspense>
  );
}

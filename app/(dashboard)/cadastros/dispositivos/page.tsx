import { Dispositivos } from "@/components/cadastros/dispositivos/dispositivos";
import { RequirePermission } from "@/components/require-permission";

export default async function CadastrosDispositivosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  return (
    <RequirePermission permission="list-acquirer">
      <Dispositivos initialSearch={search} />
    </RequirePermission>
  );
}

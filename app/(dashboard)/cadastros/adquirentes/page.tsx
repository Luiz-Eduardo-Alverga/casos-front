import { Adquirentes } from "@/components/cadastros/adquirentes/adquirentes";
import { RequirePermission } from "@/components/require-permission";

export default async function CadastrosAdquirentesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  return (
    <RequirePermission permission="list-acquirer">
      <Adquirentes initialSearch={search} initialStatus={status} />
    </RequirePermission>
  );
}

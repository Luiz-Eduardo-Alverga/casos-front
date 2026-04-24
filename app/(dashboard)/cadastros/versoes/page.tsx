import { Versoes } from "@/components/cadastros/versoes/versoes";
import { RequirePermission } from "@/components/require-permission";

export default async function CadastrosVersoesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  return (
    <RequirePermission permission="list-acquirer">
      <Versoes initialSearch={search} />
    </RequirePermission>
  );
}

import { PapeisEAcessos } from "@/components/configuracoes/papeis";
import { RequirePermission } from "@/components/require-permission";

export default async function ConfiguracoesPapeisPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; roleId?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const roleId = typeof sp.roleId === "string" ? sp.roleId : "";
  return (
    <RequirePermission permission="assign-user-role">
      <PapeisEAcessos initialSearch={search} initialRoleId={roleId} />
    </RequirePermission>
  );
}

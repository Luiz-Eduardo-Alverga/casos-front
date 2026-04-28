import { ConfiguracoesUsuarios } from "@/components/configuracoes/usuarios";
import { RequirePermission } from "@/components/require-permission";

export default async function ConfiguracoesUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";

  return (
    <RequirePermission permission="list-user">
      <ConfiguracoesUsuarios initialSearch={search} />
    </RequirePermission>
  );
}


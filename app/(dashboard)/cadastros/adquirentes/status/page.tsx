import { StatusAdquirentes } from "@/components/cadastros/status-adquirentes/index";

export default async function CadastrosStatusAdquirentesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  return <StatusAdquirentes initialSearch={search} initialStatus={status} />;
}

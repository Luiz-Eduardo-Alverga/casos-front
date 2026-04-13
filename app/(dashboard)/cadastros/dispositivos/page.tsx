import { Dispositivos } from "@/components/cadastros/dispositivos/dispositivos";

export default async function CadastrosDispositivosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  return <Dispositivos initialSearch={search} />;
}

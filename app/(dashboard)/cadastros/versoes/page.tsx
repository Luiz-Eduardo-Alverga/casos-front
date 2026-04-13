import { Versoes } from "@/components/cadastros/versoes/versoes";

export default async function CadastrosVersoesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  return <Versoes initialSearch={search} />;
}

import { AdquirentesPage } from "@/components/public/adquirentes-page";

export default async function PublicAdquirentesRoute({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  return <AdquirentesPage initialSearch={search} initialStatus={status} />;
}


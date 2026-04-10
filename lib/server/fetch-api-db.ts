import { cookies, headers } from "next/headers";

/** Tags para `next.revalidateTag` / `fetch` cache — manter iguais nas Server Actions. */
export const DB_CACHE_TAG = {
  acquirers: "db-acquirers",
  devices: "db-devices",
  versions: "db-versions",
} as const;

async function serverOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function buildCookieHeader(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

/**
 * GET em `/api/db/*` no servidor com cache por tag e envelope `{ data: T }`.
 */
export async function fetchApiDbJson<T>(
  pathname: string,
  tag: string,
  searchParams?: Record<string, string | undefined>,
): Promise<T> {
  const origin = await serverOrigin();
  const url = new URL(pathname, origin);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v != null && v !== "") url.searchParams.set(k, v);
    }
  }
  const cookie = await buildCookieHeader();
  const res = await fetch(url.toString(), {
    headers: cookie ? { Cookie: cookie } : {},
    next: { tags: [tag] },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`;
    throw new Error(msg);
  }

  if (json?.error?.message) {
    throw new Error(String(json.error.message));
  }

  if (!("data" in json)) {
    throw new Error("Resposta inválida da API");
  }

  return json.data as T;
}

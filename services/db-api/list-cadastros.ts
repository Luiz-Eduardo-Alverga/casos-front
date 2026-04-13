import { fetchWithAuth } from "@/lib/fetch";
import type { AcquirerListExpandedItem } from "@/lib/db/acquirers-expanded";
import type { DeviceRow } from "@/lib/db/devices";
import type { VersionRow } from "@/lib/db/versions";

async function parseList<T>(res: Response): Promise<T[]> {
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`,
    );
  }
  if (!Array.isArray(json.data)) {
    throw new Error("Resposta inválida da API");
  }
  return json.data as T[];
}

function buildAcquirersUrl(
  search?: string,
  expand?: "status",
  status?: string,
): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (expand) params.set("expand", expand);
  if (status?.trim()) params.set("status", status.trim());
  const qs = params.toString();
  return qs ? `/api/db/acquirers?${qs}` : "/api/db/acquirers";
}

/**
 * Lista adquirentes. Com `expand: "status"` (padrão) chama o endpoint com `?expand=status`
 * e retorna status ativo, versões e dispositivos compatíveis.
 */
export async function listAcquirersClient(
  search?: string,
  options?: { expand?: "status"; status?: string },
): Promise<AcquirerListExpandedItem[]> {
  const expand = options?.expand ?? "status";
  const res = await fetchWithAuth(
    buildAcquirersUrl(search, expand, options?.status),
  );
  return parseList<AcquirerListExpandedItem>(res);
}

function withSearch(path: string, search?: string): string {
  const q = search?.trim();
  return q ? `${path}?search=${encodeURIComponent(q)}` : path;
}

export async function listDevicesClient(search?: string): Promise<DeviceRow[]> {
  const res = await fetchWithAuth(withSearch("/api/db/devices", search));
  return parseList<DeviceRow>(res);
}

export async function listVersionsClient(
  search?: string,
): Promise<VersionRow[]> {
  const res = await fetchWithAuth(withSearch("/api/db/versions", search));
  return parseList<VersionRow>(res);
}

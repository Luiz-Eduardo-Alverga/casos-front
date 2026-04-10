import { fetchWithAuth } from "@/lib/fetch";
import type { AcquirerRow } from "@/lib/db/acquirers";
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

function withSearch(path: string, search?: string): string {
  const q = search?.trim();
  return q ? `${path}?search=${encodeURIComponent(q)}` : path;
}

export async function listAcquirersClient(
  search?: string,
): Promise<AcquirerRow[]> {
  const res = await fetchWithAuth(withSearch("/api/db/acquirers", search));
  return parseList<AcquirerRow>(res);
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

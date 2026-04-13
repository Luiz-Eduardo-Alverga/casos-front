import { fetchWithAuth } from "@/lib/fetch";
import type { AcquirerRow } from "@/lib/db/acquirers";
import type { DeviceRow } from "@/lib/db/devices";
import type { VersionRow } from "@/lib/db/versions";
import type { AcquirerUpdateInput } from "@/lib/validators/db/acquirers";
import type {
  AcquirerStatusCreateInput,
  AcquirerStatusUpdateInput,
} from "@/lib/validators/db/acquirer-status";
import type { DeviceUpdateInput } from "@/lib/validators/db/devices";
import type { VersionUpdateInput } from "@/lib/validators/db/versions";
import type { AcquirerStatusRow } from "@/lib/db/acquirer-status";
import type { AcquirerCompatibleDeviceRow } from "@/lib/db/acquirer-compatible-devices";

interface ApiDbResponse<T> {
  data?: T;
  error?: { message?: string };
}

function readErrorMessage(json: ApiDbResponse<unknown>, status: number): string {
  return typeof json?.error?.message === "string"
    ? json.error.message
    : `Erro ${status}`;
}

async function parseJson<T>(response: Response): Promise<ApiDbResponse<T>> {
  return (await response.json().catch(() => ({}))) as ApiDbResponse<T>;
}

async function parseSuccessWithData<T>(response: Response): Promise<T> {
  const json = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(json, response.status));
  }
  if (!json.data) {
    throw new Error("Resposta inválida da API");
  }
  return json.data;
}

async function parseSuccessWithoutData(response: Response): Promise<void> {
  if (response.status === 204) return;
  const json = await parseJson(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(json, response.status));
  }
}

export interface CreateDeviceClientInput {
  name: string;
}

export interface CreateAcquirerClientInput {
  name: string;
  logoUrl?: string | null;
  has4g?: boolean;
}

export interface CreateVersionClientInput {
  name?: string | null;
}

export async function getAcquirerByIdClient(id: string): Promise<AcquirerRow> {
  const response = await fetchWithAuth(`/api/db/acquirers/${id}`, { method: "GET" });
  return parseSuccessWithData<AcquirerRow>(response);
}

export async function getDeviceByIdClient(id: string): Promise<DeviceRow> {
  const response = await fetchWithAuth(`/api/db/devices/${id}`, { method: "GET" });
  return parseSuccessWithData<DeviceRow>(response);
}

export async function getVersionByIdClient(id: string): Promise<VersionRow> {
  const response = await fetchWithAuth(`/api/db/versions/${id}`, { method: "GET" });
  return parseSuccessWithData<VersionRow>(response);
}

export async function createAcquirerClient(
  input: CreateAcquirerClientInput,
): Promise<AcquirerRow> {
  const response = await fetchWithAuth("/api/db/acquirers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseSuccessWithData<AcquirerRow>(response);
}

export async function createDeviceClient(
  input: CreateDeviceClientInput,
): Promise<DeviceRow> {
  const response = await fetchWithAuth("/api/db/devices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseSuccessWithData<DeviceRow>(response);
}

export async function createVersionClient(
  input: CreateVersionClientInput,
): Promise<VersionRow> {
  const response = await fetchWithAuth("/api/db/versions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseSuccessWithData<VersionRow>(response);
}

export async function updateAcquirerClient(
  id: string,
  input: AcquirerUpdateInput,
): Promise<AcquirerRow> {
  const response = await fetchWithAuth(`/api/db/acquirers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<AcquirerRow>(response);
}

export async function updateDeviceClient(
  id: string,
  input: DeviceUpdateInput,
): Promise<DeviceRow> {
  const response = await fetchWithAuth(`/api/db/devices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<DeviceRow>(response);
}

export async function updateVersionClient(
  id: string,
  input: VersionUpdateInput,
): Promise<VersionRow> {
  const response = await fetchWithAuth(`/api/db/versions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<VersionRow>(response);
}

export async function deleteAcquirerClient(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/db/acquirers/${id}`, {
    method: "DELETE",
  });
  return parseSuccessWithoutData(response);
}

export async function deleteDeviceClient(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/db/devices/${id}`, {
    method: "DELETE",
  });
  return parseSuccessWithoutData(response);
}

export async function deleteVersionClient(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/db/versions/${id}`, {
    method: "DELETE",
  });
  return parseSuccessWithoutData(response);
}

export async function createAcquirerStatusClient(
  input: AcquirerStatusCreateInput,
): Promise<AcquirerStatusRow> {
  const response = await fetchWithAuth("/api/db/acquirer-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<AcquirerStatusRow>(response);
}

export async function getAcquirerStatusByIdClient(
  id: string,
): Promise<AcquirerStatusRow> {
  const response = await fetchWithAuth(`/api/db/acquirer-status/${id}`, {
    method: "GET",
  });
  return parseSuccessWithData<AcquirerStatusRow>(response);
}

export async function updateAcquirerStatusClient(
  id: string,
  input: AcquirerStatusUpdateInput,
): Promise<AcquirerStatusRow> {
  const response = await fetchWithAuth(`/api/db/acquirer-status/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<AcquirerStatusRow>(response);
}

export async function listAcquirerCompatibleDevicesClient(
  statusId: string,
): Promise<AcquirerCompatibleDeviceRow[]> {
  const response = await fetchWithAuth(
    `/api/db/acquirer-compatible-devices?statusId=${encodeURIComponent(statusId)}`,
    { method: "GET" },
  );
  const json = await parseJson<AcquirerCompatibleDeviceRow[]>(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(json, response.status));
  }
  if (!Array.isArray(json.data)) {
    throw new Error("Resposta inválida da API");
  }
  return json.data;
}

export async function linkAcquirerCompatibleDeviceClient(input: {
  statusId: string;
  deviceId: string;
  androidVersion?: string | null;
}): Promise<AcquirerCompatibleDeviceRow> {
  const response = await fetchWithAuth("/api/db/acquirer-compatible-devices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseSuccessWithData<AcquirerCompatibleDeviceRow>(response);
}

export async function unlinkAcquirerCompatibleDeviceClient(
  statusId: string,
  deviceId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `/api/db/acquirer-compatible-devices?statusId=${encodeURIComponent(statusId)}&deviceId=${encodeURIComponent(deviceId)}`,
    { method: "DELETE" },
  );
  return parseSuccessWithoutData(response);
}

export type PublicAcquirerListItem = {
  acquirer: {
    /** ID público opaco (não é UUID). */
    id: string;
    name: string;
    logoUrl: string | null;
    has4g: boolean;
    createdAt: string | null;
  };
  acquirerStatusId: string | null;
  sortOrder: number | null;
  status: string | null;
  currentVersionName: string | null;
  nextVersionName: string | null;
  deliveryDate: string | null;
  recommendedDeviceId: string | null;
  /** Indica `acquirer_status.is_active` do status usado no enriquecimento. */
  isActive: boolean | null;
  compatibleDevices: {
    deviceId: string;
    deviceName: string;
    androidVersion: string | null;
    isPrimary: boolean;
  }[];
};

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

function buildPublicAcquirersUrl(search?: string, status?: string): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());
  const qs = params.toString();
  return qs ? `/api/public/acquirers?${qs}` : "/api/public/acquirers";
}

/**
 * Lista adquirentes publicamente (sem autenticação), via `/api/public/acquirers`.
 * Não usa `fetchWithAuth`: rota pública (sem cookie de sessão obrigatório).
 * Mesmo shape enriquecido que `expand=status` na API interna.
 */
export async function getPublicAcquirers(params?: {
  search?: string;
  status?: string;
}): Promise<PublicAcquirerListItem[]> {
  const res = await fetch(buildPublicAcquirersUrl(params?.search, params?.status), {
    method: "GET",
  });
  return parseList<PublicAcquirerListItem>(res);
}


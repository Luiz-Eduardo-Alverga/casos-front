import type { AppUserSummary } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

interface SyncResponseBody {
  data?: {
    appUser?: AppUserSummary;
    permissions?: string[];
  };
  error?: { message?: string };
}

/**
 * Sincroniza `app_users` e permissões com a sessão atual (`POST /api/db/users/sync`).
 */
export async function syncAppUserClient(): Promise<{
  permissions: string[];
  appUser?: AppUserSummary;
} | null> {
  const res = await fetchWithAuth("/api/db/users/sync", { method: "POST" });
  const body = (await res.json().catch(() => ({}))) as SyncResponseBody;
  if (!res.ok) {
    const msg =
      typeof body?.error?.message === "string"
        ? body.error.message
        : `Erro ${res.status}`;
    throw new Error(msg);
  }
  const permissions = body.data?.permissions;
  if (!Array.isArray(permissions)) return null;
  return {
    permissions,
    appUser: body.data?.appUser,
  };
}

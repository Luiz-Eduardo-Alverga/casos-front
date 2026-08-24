import { fetchWithAuth } from "@/lib/fetch";
import type { AppUserSummary } from "@/lib/auth";

export type NotificacaoDiscordResponse = {
  receberNotificacaoDiscord: boolean;
};

export type PatchNotificacaoDiscordResponse = {
  receberNotificacaoDiscord: boolean;
  appUser: AppUserSummary;
};

async function parseJsonOk<T>(res: Response): Promise<T> {
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
  return json.data as T;
}

export async function fetchNotificacaoDiscord(
  signal?: AbortSignal,
): Promise<NotificacaoDiscordResponse> {
  const res = await fetchWithAuth("/api/db/app-users/me/notificacao-discord", {
    signal,
  });
  return parseJsonOk<NotificacaoDiscordResponse>(res);
}

export async function patchNotificacaoDiscord(
  receberNotificacaoDiscord: boolean,
): Promise<PatchNotificacaoDiscordResponse> {
  const res = await fetchWithAuth("/api/db/app-users/me/notificacao-discord", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receberNotificacaoDiscord }),
  });
  return parseJsonOk<PatchNotificacaoDiscordResponse>(res);
}

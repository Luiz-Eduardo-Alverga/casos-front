import { fetchWithAuth } from "@/lib/fetch";

/** Chama um route handler interno e devolve o JSON, ou lança com a mensagem da API. */
export async function requestJson<T>(
  path: string,
  fallback: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchWithAuth(`${window.location.origin}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || body?.message || fallback);
  }
  return body as T;
}

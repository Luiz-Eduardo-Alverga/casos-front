import { fetchWithAuth } from "@/lib/fetch";
import {
  ApiError,
  errorMessageFromBody,
} from "@/services/produtos/api-error";
import type { DeleteResponse } from "@/services/produtos/types";

export function withQuery(
  path: string,
  params: Record<string, string | number | null | undefined> = {},
): string {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return `${url.pathname}${url.search}`;
}

export async function produtosFetch<T>(
  path: string,
  init: RequestInit,
  fallback: string,
  emptyDelete?: DeleteResponse,
): Promise<T> {
  const response = await fetchWithAuth(path, init);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorMessageFromBody(error, fallback));
  }

  if (response.status === 204) {
    return (emptyDelete ?? { success: true, message: fallback }) as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return (emptyDelete ?? { success: true, message: fallback }) as T;
  }

  return JSON.parse(text) as T;
}

export function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

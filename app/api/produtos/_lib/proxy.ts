import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";
import type { PermittedSession } from "@/lib/api-db/with-permission";
import { errorMessageFromBody } from "@/services/produtos/api-error";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

export type ProductPermission =
  | "list-product"
  | "create-product"
  | "edit-product"
  | "delete-product";

export function extractApiError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      status?: number;
      data?: unknown;
    };
    message?: string;
  };
  return {
    status: err?.response?.status ?? 500,
    message: errorMessageFromBody(
      err?.response?.data,
      err?.message ?? fallback,
    ),
  };
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function readJsonBody<T>(
  request: Request,
): Promise<T | Response> {
  try {
    return (await request.json()) as T;
  } catch {
    return jsonError("JSON inválido", 400);
  }
}

export function isErrorResponse(value: unknown): value is Response {
  return value instanceof Response;
}

export function paginationParams(url: URL) {
  const per_page = url.searchParams.get("per_page") ?? undefined;
  const cursor = url.searchParams.get("cursor") ?? undefined;
  return {
    ...(per_page ? { per_page } : {}),
    ...(cursor !== undefined ? { cursor } : {}),
  };
}

export function parseProdutoId(id: string | undefined): number | Response {
  if (!id) {
    return jsonError("ID do produto é obrigatório", 400);
  }
  const registro = Number(id);
  if (!Number.isFinite(registro)) {
    return jsonError("ID do produto inválido", 400);
  }
  return registro;
}

export function nowIso() {
  return new Date().toISOString();
}

export async function proxyLegacy(
  fallback: string,
  run: () => Promise<AxiosResponse>,
): Promise<Response> {
  try {
    const response = await run();
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }
    return Response.json(response.data ?? { success: true }, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error(fallback, error);
    const { status, message } = extractApiError(error, fallback);
    return jsonError(message, status);
  }
}

export function authConfig(
  session: PermittedSession,
  extra?: AxiosRequestConfig,
): AxiosRequestConfig {
  return {
    ...extra,
    headers: {
      "Content-Type": "application/json",
      ...session.authorizationHeader,
      ...extra?.headers,
    },
  };
}

export { api, withPermission };
export type { PermittedSession };

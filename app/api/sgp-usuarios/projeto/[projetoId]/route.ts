import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type {
  SgpUsuarioProjetoRaw,
  SgpUsuariosByProjetoResponse,
} from "@/interfaces/sgp-usuario-projeto";
import {
  enrichSgpUsuariosProjeto,
  fetchUsuariosCatalogMap,
} from "@/lib/sgp-usuarios/enrich-usuarios-autorizados";

function extractApiError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string };
    };
    message?: string;
  };
  return {
    status: err?.response?.status ?? 500,
    message:
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projetoId: string }> },
) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { projetoId } = await params;
      if (!projetoId) {
        return Response.json(
          { error: "ID do projeto é obrigatório" },
          { status: 400 },
        );
      }

      const url = new URL(request.url);
      const per_page = url.searchParams.get("per_page") ?? undefined;
      const cursor = url.searchParams.get("cursor") ?? undefined;

      const requestParams = {
        ...(per_page ? { per_page } : {}),
        ...(cursor ? { cursor } : {}),
      };

      const [sgpResponse, usuariosCatalog] = await Promise.all([
        api.get(`/sgp-usuarios/projeto/${projetoId}`, {
          params: requestParams,
          headers: authHeaders,
        }),
        fetchUsuariosCatalogMap(api, authHeaders),
      ]);

      const payload = sgpResponse.data as SgpUsuariosByProjetoResponse;
      const rawItems = (payload?.data ?? []) as SgpUsuarioProjetoRaw[];

      const enriched: SgpUsuariosByProjetoResponse = {
        success: payload?.success ?? true,
        data: enrichSgpUsuariosProjeto(rawItems, usuariosCatalog),
        pagination: payload?.pagination ?? {
          per_page: rawItems.length,
          next_cursor: null,
          prev_cursor: null,
          has_more: false,
        },
      };

      return Response.json(enriched, {
        status: sgpResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error(
        "Erro na API Route de sgp-usuarios autorizados por projeto:",
        error,
      );
      const { status, message } = extractApiError(
        error,
        "Erro ao buscar usuários autorizados do projeto",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

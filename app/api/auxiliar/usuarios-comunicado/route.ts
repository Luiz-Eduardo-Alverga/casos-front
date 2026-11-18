import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import {
  extractApiError,
  isErrorResponse,
  readJsonBody,
} from "@/app/api/produtos/_lib/proxy";
import type { ComunicadoFiltros } from "@/services/comunicados/types";

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await readJsonBody<ComunicadoFiltros>(request);
    if (isErrorResponse(body)) return body;

    const response = await api.post("/auxiliar/usuarios-comunicado", body, {
      headers: { "Content-Type": "application/json", ...authHeaders },
    });
    return Response.json(response.data, { status: response.status });
  } catch (error: unknown) {
    console.error("Erro na API Route de usuarios-comunicado:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar usuários do comunicado",
    );
    return Response.json({ error: message }, { status });
  }
}

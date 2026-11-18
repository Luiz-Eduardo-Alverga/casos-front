import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { extractApiError } from "@/app/api/produtos/_lib/proxy";

export async function GET() {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const response = await api.get("/auxiliar/comunicado-filtros", {
      headers: authHeaders,
    });
    return Response.json(response.data, { status: response.status });
  } catch (error: unknown) {
    console.error("Erro na API Route de comunicado-filtros:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar filtros de comunicado",
    );
    return Response.json({ error: message }, { status });
  }
}

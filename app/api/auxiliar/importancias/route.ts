import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tipo = url.searchParams.get("tipo");

    if (!tipo) {
      return Response.json(
        { error: "Parâmetro tipo é obrigatório" },
        { status: 400 },
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/auxiliar/importancias", {
      params: { tipo },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Erro na API Route de importâncias:", error);
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message || err?.message || "Erro ao buscar importâncias";
    return Response.json({ error: errorMessage }, { status });
  }
}

import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const lido = url.searchParams.get("lido");
    const data_msg_inicio = url.searchParams.get("data_msg_inicio");
    const data_msg_fim = url.searchParams.get("data_msg_fim");

    const params: Record<string, string> = {};
    if (id != null && id !== "") params.id = id;
    if (lido != null && lido !== "") params.lido = lido;
    if (data_msg_inicio != null && data_msg_inicio !== "")
      params.data_msg_inicio = data_msg_inicio;
    if (data_msg_fim != null && data_msg_fim !== "")
      params.data_msg_fim = data_msg_fim;

    const response = await api.get("/mensagens", {
      params,
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    console.error("Erro na API Route de mensagens:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ?? err?.message ?? "Erro ao buscar mensagens";
    return Response.json({ error: errorMessage }, { status });
  }
}

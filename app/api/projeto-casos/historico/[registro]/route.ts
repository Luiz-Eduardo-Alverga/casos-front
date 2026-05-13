import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> }
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro: registroParam } = await params;

    if (!registroParam) {
      return Response.json(
        { error: "Parâmetro registro é obrigatório" },
        { status: 400 }
      );
    }

    const registro = Number(registroParam);
    if (!Number.isFinite(registro)) {
      return Response.json(
        { error: "Parâmetro registro inválido" },
        { status: 400 }
      );
    }

    const response = await api.get(`/projeto-casos/historico/${registro}`, {
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao buscar histórico do caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao buscar histórico do caso";
    return Response.json({ error: errorMessage }, { status });
  }
}

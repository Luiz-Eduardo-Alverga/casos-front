import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { AddLiberacaoVersoesRequest } from "@/interfaces/liberacao";

function validateAddLiberacaoVersoesBody(
  body: AddLiberacaoVersoesRequest,
): Response | null {
  if (!Array.isArray(body?.versoes) || body.versoes.length === 0) {
    return Response.json(
      { error: "versoes é obrigatório e deve conter ao menos um item" },
      { status: 400 },
    );
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as AddLiberacaoVersoesRequest;
    const validationError = validateAddLiberacaoVersoesBody(body);
    if (validationError) return validationError;

    const response = await api.post(
      `/sprint/liberacoes/${registro}/versoes`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route ao adicionar versões à liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao adicionar versões à liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

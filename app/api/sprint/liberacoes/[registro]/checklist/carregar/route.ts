import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function POST(
  _request: Request,
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

    const response = await api.post(
      `/sprint/liberacoes/${registro}/checklist/carregar`,
      {},
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
    console.error(
      "Erro na API Route ao carregar checklist da liberação:",
      error,
    );
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao carregar checklist da liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

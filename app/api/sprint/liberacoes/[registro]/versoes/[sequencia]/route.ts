import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ registro: string; sequencia: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro, sequencia } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    if (!sequencia) {
      return Response.json(
        { error: "Parametro sequencia é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(
      `/sprint/liberacoes/${registro}/versoes/${sequencia}`,
      { headers: authHeaders },
    );

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    return Response.json(response.data ?? { success: true }, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route ao excluir versão da liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao excluir versão da liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

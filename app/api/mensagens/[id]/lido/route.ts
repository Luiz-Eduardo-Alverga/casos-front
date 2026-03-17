import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.put(`/mensagens/${id}/lido`, undefined, {
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
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao marcar mensagem como lida:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.message ??
      "Erro ao marcar mensagem como lida";
    return Response.json({ error: errorMessage }, { status });
  }
}

import { api } from "@/lib/axios";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.put(`/mensagens/${id}/lido`, undefined, {
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
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

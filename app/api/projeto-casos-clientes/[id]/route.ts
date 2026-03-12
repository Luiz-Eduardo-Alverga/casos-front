import { api } from "@/lib/axios";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID do vínculo cliente-caso é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.delete(`/projeto-casos-clientes/${id}`, {
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
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route ao remover cliente do caso:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao remover cliente do caso";
    return Response.json({ error: errorMessage }, { status });
  }
}

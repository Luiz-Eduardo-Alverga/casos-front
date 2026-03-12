import { api } from "@/lib/axios";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID da anotação é obrigatório" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.put(`/projeto-casos-anotacoes/${id}`, body, {
      headers: {
        "Content-Type": "application/json",
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
    console.error("Erro na API Route ao atualizar anotação:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao atualizar anotação";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "ID da anotação é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.delete(`/projeto-casos-anotacoes/${id}`, {
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
    console.error("Erro na API Route ao excluir anotação:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao excluir anotação";
    return Response.json({ error: errorMessage }, { status });
  }
}

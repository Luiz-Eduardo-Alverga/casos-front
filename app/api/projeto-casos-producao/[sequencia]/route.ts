import { api } from "@/lib/axios";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sequencia: string }> }
) {
  try {
    const { sequencia } = await params;

    if (!sequencia) {
      return Response.json(
        { error: "Parâmetro sequencia é obrigatório" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.put(
      `/projeto-casos-producao/${encodeURIComponent(sequencia)}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
      }
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route ao atualizar produção:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao atualizar produção";

    return Response.json({ error: errorMessage }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sequencia: string }> }
) {
  try {
    const { sequencia } = await params;

    if (!sequencia) {
      return Response.json(
        { error: "Parâmetro sequencia é obrigatório" },
        { status: 400 }
      );
    }

    const authorization = request.headers.get("authorization") ?? undefined;

    const response = await api.delete(
      `/projeto-casos-producao/${encodeURIComponent(sequencia)}`,
      {
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
        },
      }
    );

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route ao excluir produção:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao excluir produção";

    return Response.json({ error: errorMessage }, { status });
  }
}

import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function PUT(
  request: Request,
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
        { error: "ID da ordem é obrigatório" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const id_colaborador = body?.id_colaborador;
    const id_produto = body?.id_produto;
    const versao = body?.versao;
    const ordem = body?.ordem;

    if (
      id_colaborador === undefined ||
      id_produto === undefined ||
      versao === undefined ||
      ordem === undefined
    ) {
      return Response.json(
        {
          error:
            "Campos obrigatórios: id_colaborador, id_produto, versao, ordem",
        },
        { status: 400 }
      );
    }

    const response = await api.put(
      `/projeto-dev-produtos-ordem/${id}`,
      { id_colaborador, id_produto, versao, ordem },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
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
      response?: { status?: number; data?: { message?: string; error?: string } };
      message?: string;
    };
    console.error("Erro na API Route de alteração de ordem:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao alterar ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return Response.json(
        { error: "ID da ordem é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(`/projeto-dev-produtos-ordem/${id}`, {
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
    console.error("Erro na API Route de exclusão de ordem:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao excluir ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}


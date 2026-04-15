import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const id_colaborador = body?.id_colaborador;
    const ids = body?.ids;
    const start_at = body?.start_at;

    if (
      id_colaborador === undefined ||
      !Array.isArray(ids) ||
      ids.length === 0 ||
      start_at === undefined
    ) {
      return Response.json(
        {
          error:
            "Campos obrigatórios: id_colaborador, ids (array), start_at",
        },
        { status: 400 }
      );
    }

    const response = await api.post(
      "/projeto-dev-produtos-ordem/bulk-update-ordem",
      { id_colaborador, ids, start_at },
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
    console.error("Erro na API Route de bulk update de ordem:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao atualizar ordem";
    return Response.json({ error: errorMessage }, { status });
  }
}


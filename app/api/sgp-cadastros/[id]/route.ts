import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateSgpCadastroRequest } from "@/interfaces/sgp-cadastro";

function extractApiError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string };
    };
    message?: string;
  };
  return {
    status: err?.response?.status ?? 500,
    message:
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const { id } = await params;

      if (!id) {
        return Response.json(
          { error: "ID do cadastro é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.get(`/sgp-cadastros/${id}`, {
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
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };
      console.error("Erro na API Route de sgp-cadastros por ID:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao buscar cadastro SGP";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { id } = await params;
      if (!id) {
        return Response.json(
          { error: "ID do cadastro é obrigatório" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateSgpCadastroRequest;

      if (!body?.NomeProjeto?.trim()) {
        return Response.json(
          { error: "NomeProjeto é obrigatório" },
          { status: 400 },
        );
      }
      if (!body?.Datas?.trim()) {
        return Response.json({ error: "Datas é obrigatório" }, { status: 400 });
      }
      if (!body?.Tipo?.trim()) {
        return Response.json({ error: "Tipo é obrigatório" }, { status: 400 });
      }
      if (!body?.Status?.trim()) {
        return Response.json({ error: "Status é obrigatório" }, { status: 400 });
      }

      const response = await api.put(`/sgp-cadastros/${id}`, body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao atualizar sgp-cadastros:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao atualizar cadastro SGP",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

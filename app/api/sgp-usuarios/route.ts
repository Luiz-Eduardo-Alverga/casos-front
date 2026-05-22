import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { CreateSgpUsuarioRequest } from "@/interfaces/sgp-cadastro";

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

export async function POST(request: Request) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = (await request.json()) as CreateSgpUsuarioRequest;

      if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
        return Response.json(
          { error: "Registro (projeto) é obrigatório" },
          { status: 400 },
        );
      }
      if (body?.Usuario == null || Number.isNaN(Number(body.Usuario))) {
        return Response.json(
          { error: "Usuario é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.post(
        "/sgp-usuarios",
        {
          Registro: body.Registro,
          Usuario: body.Usuario,
        },
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
    } catch (error: unknown) {
      console.error("Erro na API Route ao cadastrar sgp-usuarios:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao adicionar usuário autorizado",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

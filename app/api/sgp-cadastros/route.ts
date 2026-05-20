import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { CreateSgpCadastroRequest } from "@/interfaces/sgp-cadastro";

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
  return withPermission("create-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = (await request.json()) as CreateSgpCadastroRequest;

      if (!body?.NomeProjeto?.trim()) {
        return Response.json(
          { error: "NomeProjeto é obrigatório" },
          { status: 400 },
        );
      }
      if (body.Cliente == null) {
        return Response.json({ error: "Cliente é obrigatório" }, { status: 400 });
      }
      if (body.Usuario == null) {
        return Response.json({ error: "Usuario é obrigatório" }, { status: 400 });
      }

      const cadastroResponse = await api.post("/sgp-cadastros", body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      const registro = cadastroResponse.data?.data?.registro;
      if (registro == null) {
        return Response.json(
          { error: "Cadastro criado, mas registro não retornado pela API" },
          { status: 502 },
        );
      }

      const usuarioResponse = await api.post(
        "/sgp-usuarios",
        {
          Registro: registro,
          Usuario: body.Usuario,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        },
      );

      return Response.json(
        {
          success: true,
          message: cadastroResponse.data?.message ?? "Projeto cadastrado com sucesso",
          cadastro: cadastroResponse.data,
          usuario: usuarioResponse.data,
        },
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: unknown) {
      console.error("Erro na API Route de cadastro SGP:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao cadastrar projeto",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

export async function GET(request: Request) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const url = new URL(request.url);
      const setor = url.searchParams.get("Setor") ?? undefined;
      const registro = url.searchParams.get("Registro") ?? undefined;
      const objetivo_id = url.searchParams.get("objetivo_id") ?? undefined;
      const per_page = url.searchParams.get("per_page") ?? undefined;
      const cursor = url.searchParams.get("cursor") ?? undefined;

      const response = await api.get("/sgp-cadastros", {
        params: {
          ...(setor ? { Setor: setor } : {}),
          ...(registro ? { Registro: registro } : {}),
          ...(objetivo_id ? { objetivo_id } : {}),
          ...(per_page ? { per_page } : {}),
          ...(cursor !== undefined ? { cursor } : {}),
        },
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route de sgp-cadastros:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao buscar cadastros SGP",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
